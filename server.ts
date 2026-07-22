import { createServer } from "http";
import next from "next";
import { Server, Socket } from "socket.io";

import { prisma } from "./lib/prisma";
import { setSocketServer } from "./lib/io";
import { sendPushNotification } from "./lib/push/sendPushNotification";

const dev = process.env.NODE_ENV !== "production";

const hostname =
process.env.SERVER_HOST || "0.0.0.0";

const port = parseInt(
process.env.PORT || "3000",
10
);

const app = next({
dev,
hostname,
port,
});

const handle = app.getRequestHandler();

let io: Server;

// ======================================================
// GLOBAL CHAT
// ======================================================

async function getGlobalChat() {
let chat = await prisma.chat.findFirst({
where: {
isGroup: true,
name: "Chat Global",
},
});

if (!chat) {
chat = await prisma.chat.create({
data: {
isGroup: true,
name: "Chat Global",
},
});
}

return chat;
}

let globalChatId: string | null = null;

async function ensureGlobalChatId(): Promise<string> {
if (globalChatId) {
return globalChatId;
}

const chat = await getGlobalChat();

globalChatId = chat.id;

return globalChatId;
}

// ======================================================
// NOTIFICATIONS CORE
// ======================================================

async function sendNotification({
toUserId,
fromUserId,
type,
message,
entityId,
entityType,
data,
}: {
toUserId: string;
fromUserId?: string;
type: string;
message: string;
entityId?: string;
entityType?: string;
data?: any;
}) {
const notif = await prisma.notification.create({
data: {
userId: toUserId,
senderId: fromUserId,
type,
message,
entityId,
entityType,
metadata: data ?? {},
},
});

io.to(`user:${toUserId}`).emit(
"notification:new",
notif
);

try {
await sendPushNotification(toUserId, {
title: "ChurchFace",
body: message,
url: entityId
? `/post/${entityId}`
: "/",
type,
});
} catch (err) {
console.error(
"Push notification error:",
err
);
}

return notif;
}

// ======================================================
// RADIO STATE
// ======================================================

type RadioParticipantRole =
| "broadcaster"
| "listener";

type RadioParticipant = {
socketId: string;
role: RadioParticipantRole;
};

const radioParticipants = new Map<
string,
Map<string, RadioParticipant>

> ();

// ======================================================
// RADIO HELPERS
// ======================================================

function getRadioParticipants(
radioId: string
) {
let participants =
radioParticipants.get(radioId);

if (!participants) {
participants = new Map();


radioParticipants.set(
  radioId,
  participants
);


}

return participants;
}

function getRadioParticipant(
radioId: string,
socketId: string
) {
return radioParticipants
.get(radioId)
?.get(socketId);
}

function isRadioParticipant(
radioId: string,
socketId: string,
role?: RadioParticipantRole
) {
const participant =
getRadioParticipant(
radioId,
socketId
);

if (!participant) {
return false;
}

if (
role &&
participant.role !== role
) {
return false;
}

return true;
}

function getBroadcaster(
radioId: string
) {
const participants =
radioParticipants.get(radioId);

if (!participants) {
return null;
}

for (
const participant of
participants.values()
) {
if (
participant.role ===
"broadcaster"
) {
return participant;
}
}

return null;
}

function getRadioListenerCount(
radioId: string
) {
const participants =
radioParticipants.get(radioId);

if (!participants) {
return 0;
}

let count = 0;

for (
const participant of
participants.values()
) {
if (
participant.role ===
"listener"
) {
count++;
}
}

return count;
}

function emitRadioStats(
radioId: string
) {
io.to(`radio:${radioId}`).emit(
"radio:stats",
{
listenerCount:
getRadioListenerCount(
radioId
),
}
);
}

function clearSocketRadioState(
socket: Socket
) {
socket.data.radioId =
undefined;

socket.data.radioRole =
undefined;
}

function removeRadioParticipant(
radioId: string,
socketId: string
) {
const participants =
radioParticipants.get(radioId);

if (!participants) {
return null;
}

const participant =
participants.get(socketId);

if (!participant) {
return null;
}

participants.delete(socketId);

if (participants.size === 0) {
radioParticipants.delete(
radioId
);
}

return participant;
}

function leaveRadioSession(
socket: Socket,
radioId: string
) {
const participant =
removeRadioParticipant(
radioId,
socket.id
);

if (!participant) {
return null;
}

socket.leave(
`radio:${radioId}`
);

if (
socket.data.radioId ===
radioId
) {
clearSocketRadioState(
socket
);
}

return participant;
}

function removeSocketFromAllRadios(
socketId: string
) {
const removed: Array<{
radioId: string;
participant: RadioParticipant;
}> = [];

for (
const [
radioId,
participants,
] of radioParticipants.entries()
) {
const participant =
participants.get(socketId);


if (!participant) {
  continue;
}

participants.delete(
  socketId
);

removed.push({
  radioId,
  participant,
});

if (
  participants.size === 0
) {
  radioParticipants.delete(
    radioId
  );
}


}

return removed;
}

// ======================================================
// RADIO REGISTRATION
// ======================================================

function registerRadioParticipant({
socket,
radioId,
role,
}: {
socket: Socket;
radioId: string;
role: RadioParticipantRole;
}) {
const previousMemberships =
removeSocketFromAllRadios(
socket.id
);

for (
const membership of
previousMemberships
) {
socket.leave(
`radio:${membership.radioId}`
);


if (
  membership.participant.role ===
  "broadcaster"
) {
  io.to(
    `radio:${membership.radioId}`
  ).emit(
    "radio:status",
    {
      isLive: false,
    }
  );
}

io.to(
  `radio:${membership.radioId}`
).emit(
  "radio:peer-left",
  {
    socketId:
      socket.id,
  }
);

emitRadioStats(
  membership.radioId
);


}

const participants =
getRadioParticipants(
radioId
);

if (
role === "broadcaster"
) {
for (
const [
participantSocketId,
participant,
] of participants.entries()
) {
if (
participant.role !==
"broadcaster" ||
participantSocketId ===
socket.id
) {
continue;
}


  participants.delete(
    participantSocketId
  );

  const previousSocket =
    io.sockets.sockets.get(
      participantSocketId
    );

  if (previousSocket) {
    previousSocket.leave(
      `radio:${radioId}`
    );

    clearSocketRadioState(
      previousSocket
    );

    previousSocket.emit(
      "radio:peer-left",
      {
        socketId:
          participantSocketId,
      }
    );
  }
}


}

participants.set(
socket.id,
{
socketId:
socket.id,
role,
}
);

socket.join(
`radio:${radioId}`
);

socket.data.radioId =
radioId;

socket.data.radioRole =
role;

return participants;
}

// ======================================================
// WEBRTC PEER VALIDATION
// ======================================================

function isValidRadioPeerConnection({
radioId,
sourceSocketId,
targetSocketId,
sourceRole,
targetRole,
}: {
radioId: string;
sourceSocketId: string;
targetSocketId: string;
sourceRole: RadioParticipantRole;
targetRole: RadioParticipantRole;
}) {
if (
!radioId ||
!sourceSocketId ||
!targetSocketId
) {
return false;
}

if (
sourceSocketId ===
targetSocketId
) {
return false;
}

if (
!isRadioParticipant(
radioId,
sourceSocketId,
sourceRole
)
) {
return false;
}

if (
!isRadioParticipant(
radioId,
targetSocketId,
targetRole
)
) {
return false;
}

return true;
}

function emitToRadioPeer({
radioId,
sourceSocketId,
targetSocketId,
sourceRole,
targetRole,
event,
payload,
}: {
radioId: string;
sourceSocketId: string;
targetSocketId: string;
sourceRole: RadioParticipantRole;
targetRole: RadioParticipantRole;
event: string;
payload: unknown;
}) {
const valid =
isValidRadioPeerConnection({
radioId,
sourceSocketId,
targetSocketId,
sourceRole,
targetRole,
});

if (!valid) {
return false;
}

const targetSocket =
io.sockets.sockets.get(
targetSocketId
);

if (!targetSocket) {
return false;
}

targetSocket.emit(
event,
payload
);

return true;
}

// ======================================================
// SERVER INIT
// ======================================================

app.prepare().then(
async () => {
const httpServer =
createServer(handle);


const allowedOrigins = (
  process.env
    .SOCKET_CORS_ORIGINS ||
  process.env
    .NEXT_PUBLIC_APP_URL ||
  (
    dev
      ? "http://localhost:3000"
      : ""
  )
)
  .split(",")
  .map(
    (origin) =>
      origin.trim()
  )
  .filter(Boolean);

io = new Server(
  httpServer,
  {
    cors: {
      origin:
        allowedOrigins.length >
        0
          ? allowedOrigins
          : false,

      credentials: true,
    },

    path: "/socket.io",
  }
);

setSocketServer(io);

io.on(
  "connection",
  (socket) => {
    console.log(
      "Socket connected:",
      socket.id
    );

    socket.onAny(
      (
        eventName,
        ...args
      ) => {
        console.log(
          "Socket event received:",
          eventName,
          args
        );
      }
    );

    // ==================================================
    // REGISTER USER
    // ==================================================

    socket.on(
      "register",
      (userId: string) => {
        if (!userId) {
          return;
        }

        socket.join(
          `user:${userId}`
        );

        socket.data.userId =
          userId;
      }
    );

    // ==================================================
    // CHURCH FEED
    // ==================================================

    socket.on(
      "joinChurch",
      (churchId: string) => {
        if (!churchId) {
          return;
        }

        socket.join(
          `church:${churchId}`
        );
      }
    );

    socket.on(
      "leaveChurch",
      (churchId: string) => {
        if (!churchId) {
          return;
        }

        socket.leave(
          `church:${churchId}`
        );
      }
    );

    // ==================================================
    // GLOBAL CHAT
    // ==================================================

    socket.on(
      "chat:new",
      async (msg: any) => {
        try {
          if (
            !msg?.content ||
            !msg?.userId
          ) {
            return;
          }

          const chatId =
            await ensureGlobalChatId();

          const saved =
            await prisma.message.create(
              {
                data: {
                  content:
                    msg.content,

                  chatId,

                  senderId:
                    msg.userId,
                },

                include: {
                  sender: {
                    select: {
                      name: true,
                      image: true,
                    },
                  },
                },
              }
            );

          io.emit(
            "chat:new",
            {
              id: saved.id,

              user:
                saved.sender
                  ?.name ||
                "Anonyme",

              content:
                saved.content,

              createdAt:
                saved.createdAt,
            }
          );
        } catch (err) {
          console.error(
            "Global chat error:",
            err
          );
        }
      }
    );

    // ==================================================
    // PRIVATE CHAT
    // ==================================================

    socket.on(
      "message:send",
      async (msg: any) => {
        if (!msg?.chatId) {
          return;
        }

        io.to(
          msg.chatId
        ).emit(
          "message:new",
          msg
        );
      }
    );

    // ==================================================
    // SOCIAL EVENTS
    // ==================================================

    socket.on(
      "post:like",
      async ({
        postId,
        fromUserId,
        postOwnerId,
      }) => {
        try {
          if (
            !postId ||
            !fromUserId ||
            !postOwnerId ||
            fromUserId ===
              postOwnerId
          ) {
            return;
          }

          await sendNotification({
            toUserId:
              postOwnerId,

            fromUserId,

            type: "LIKE",

            message:
              "a aimé votre publication ❤️",

            entityId:
              postId,

            entityType:
              "post",
          });
        } catch (err) {
          console.error(
            "post:like notification failed:",
            err
          );
        }
      }
    );

    socket.on(
      "post:comment",
      async ({
        postId,
        fromUserId,
        postOwnerId,
      }) => {
        try {
          if (
            !postId ||
            !fromUserId ||
            !postOwnerId ||
            fromUserId ===
              postOwnerId
          ) {
            return;
          }

          await sendNotification({
            toUserId:
              postOwnerId,

            fromUserId,

            type:
              "COMMENT",

            message:
              "a commenté votre publication 💬",

            entityId:
              postId,

            entityType:
              "post",
          });
        } catch (err) {
          console.error(
            "post:comment notification failed:",
            err
          );
        }
      }
    );

    socket.on(
      "user:follow",
      async ({
        fromUserId,
        toUserId,
      }) => {
        try {
          if (
            !fromUserId ||
            !toUserId ||
            fromUserId ===
              toUserId
          ) {
            return;
          }

          await sendNotification({
            toUserId,

            fromUserId,

            type: "FOLLOW",

            message:
              "a commencé à vous suivre 👤",
          });
        } catch (err) {
          console.error(
            "user:follow notification failed:",
            err
          );
        }
      }
    );

    // ==================================================
    // TYPING
    // ==================================================

    socket.on(
      "typing",
      ({
        chatId,
        userId,
        isTyping,
      }) => {
        if (!chatId) {
          return;
        }

        socket
          .to(chatId)
          .emit(
            "typing:update",
            {
              userId,
              isTyping,
            }
          );
      }
    );

    // ==================================================
    // SEEN MESSAGES
    // ==================================================

    socket.on(
      "message:seen",
      async ({
        chatId,
        userId,
      }) => {
        try {
          if (
            !chatId ||
            !userId
          ) {
            return;
          }

          const unseen =
            await prisma.message.findMany(
              {
                where: {
                  chatId,

                  senderId: {
                    not: userId,
                  },
                },

                select: {
                  id: true,
                },
              }
            );

          for (
            const msg of unseen
          ) {
            await prisma.messageSeen.upsert(
              {
                where: {
                  messageId_userId:
                    {
                      messageId:
                        msg.id,

                      userId,
                    },
                },

                create: {
                  messageId:
                    msg.id,

                  userId,
                },

                update: {},
              }
            );
          }

          io.to(chatId).emit(
            "message:seen",
            {
              userId,
              chatId,
            }
          );
        } catch (err) {
          console.error(
            "message:seen handler failed:",
            err
          );
        }
      }
    );

    // ==================================================
    // STREAM
    // ==================================================

    socket.on(
      "stream:join",
      (streamId: string) => {
        if (!streamId) {
          return;
        }

        socket.join(
          `stream:${streamId}`
        );
      }
    );

    socket.on(
      "stream:chat",
      ({
        streamId,
        msg,
      }) => {
        if (!streamId) {
          return;
        }

        io.to(
          `stream:${streamId}`
        ).emit(
          "stream:chat",
          msg
        );
      }
    );

    socket.on(
      "stream:leave",
      (streamId: string) => {
        if (!streamId) {
          return;
        }

        socket.leave(
          `stream:${streamId}`
        );
      }
    );

    // ==================================================
    // RADIO
    // ==================================================

    socket.on(
      "radio:join",
      (radioId: string) => {
        if (!radioId) {
          return;
        }

        const currentParticipant =
          getRadioParticipant(
            radioId,
            socket.id
          );

        if (currentParticipant) {
          return;
        }

        registerRadioParticipant({
          socket,
          radioId,
          role: "listener",
        });

        const broadcaster =
          getBroadcaster(
            radioId
          );

        if (broadcaster) {
          emitToRadioPeer({
            radioId,

            sourceSocketId:
              socket.id,

            targetSocketId:
              broadcaster.socketId,

            sourceRole:
              "listener",

            targetRole:
              "broadcaster",

            event:
              "radio:listener-joined",

            payload:
              socket.id,
          });
        }

        emitRadioStats(
          radioId
        );
      }
    );

    socket.on(
      "radio:leave",
      (radioId: string) => {
        if (!radioId) {
          return;
        }

        const participant =
          getRadioParticipant(
            radioId,
            socket.id
          );

        if (
          !participant ||
          participant.role !==
            "listener"
        ) {
          return;
        }

        const removed =
          leaveRadioSession(
            socket,
            radioId
          );

        if (!removed) {
          return;
        }

        io.to(
          `radio:${radioId}`
        ).emit(
          "radio:peer-left",
          {
            socketId:
              socket.id,
          }
        );

        emitRadioStats(
          radioId
        );
      }
    );

    socket.on(
      "radio:broadcast-join",
      (radioId: string) => {
        if (!radioId) {
          return;
        }

        const currentParticipant =
          getRadioParticipant(
            radioId,
            socket.id
          );

        if (currentParticipant) {
          return;
        }

        const participants =
          registerRadioParticipant({
            socket,
            radioId,
            role: "broadcaster",
          });

        for (
          const participant of
          participants.values()
        ) {
          if (
            participant.role !==
            "listener"
          ) {
            continue;
          }

          socket.emit(
            "radio:listener-joined",
            participant.socketId
          );
        }

        io.to(
          `radio:${radioId}`
        ).emit(
          "radio:status",
          {
            isLive: true,
          }
        );

        emitRadioStats(
          radioId
        );
      }
    );

    socket.on(
      "radio:broadcast-leave",
      (radioId: string) => {
        if (!radioId) {
          return;
        }

        const participant =
          getRadioParticipant(
            radioId,
            socket.id
          );

        if (
          !participant ||
          participant.role !==
            "broadcaster"
        ) {
          return;
        }

        const removed =
          leaveRadioSession(
            socket,
            radioId
          );

        if (!removed) {
          return;
        }

        io.to(
          `radio:${radioId}`
        ).emit(
          "radio:peer-left",
          {
            socketId:
              socket.id,
          }
        );

        io.to(
          `radio:${radioId}`
        ).emit(
          "radio:status",
          {
            isLive: false,
          }
        );

        emitRadioStats(
          radioId
        );
      }
    );

    socket.on(
      "radio:request-offer",
      (radioId: string) => {
        if (!radioId) {
          return;
        }

        if (
          !isRadioParticipant(
            radioId,
            socket.id,
            "listener"
          )
        ) {
          return;
        }

        const broadcaster =
          getBroadcaster(
            radioId
          );

        if (!broadcaster) {
          return;
        }

        emitToRadioPeer({
          radioId,

          sourceSocketId:
            socket.id,

          targetSocketId:
            broadcaster.socketId,

          sourceRole:
            "listener",

          targetRole:
            "broadcaster",

          event:
            "radio:listener-joined",

          payload:
            socket.id,
        });
      }
    );

    socket.on(
      "radio:offer",
      ({
        radioId,
        offer,
        target,
      }: {
        radioId: string;
        offer: RTCSessionDescriptionInit;
        target: string;
      }) => {
        if (
          !radioId ||
          !offer ||
          !target
        ) {
          return;
        }

        const delivered =
          emitToRadioPeer({
            radioId,

            sourceSocketId:
              socket.id,

            targetSocketId:
              target,

            sourceRole:
              "broadcaster",

            targetRole:
              "listener",

            event:
              "radio:offer",

            payload: {
              offer,

              senderId:
                socket.id,
            },
          });

        if (!delivered) {
          console.warn(
            "Rejected stale radio offer",
            {
              radioId,
              source:
                socket.id,
              target,
            }
          );
        }
      }
    );

    socket.on(
      "radio:answer",
      ({
        radioId,
        answer,
        target,
      }: {
        radioId: string;
        answer: RTCSessionDescriptionInit;
        target: string;
      }) => {
        if (
          !radioId ||
          !answer ||
          !target
        ) {
          return;
        }

        const delivered =
          emitToRadioPeer({
            radioId,

            sourceSocketId:
              socket.id,

            targetSocketId:
              target,

            sourceRole:
              "listener",

            targetRole:
              "broadcaster",

            event:
              "radio:answer",

            payload: {
              answer,

              senderId:
                socket.id,
            },
          });

        if (!delivered) {
          console.warn(
            "Rejected stale radio answer",
            {
              radioId,
              source:
                socket.id,
              target,
            }
          );
        }
      }
    );

    socket.on(
      "radio:ice-candidate",
      ({
        radioId,
        candidate,
        target,
      }: {
        radioId: string;
        candidate: RTCIceCandidateInit;
        target: string;
      }) => {
        if (
          !radioId ||
          !candidate ||
          !target
        ) {
          return;
        }

        const sourceParticipant =
          getRadioParticipant(
            radioId,
            socket.id
          );

        const targetParticipant =
          getRadioParticipant(
            radioId,
            target
          );

        if (
          !sourceParticipant ||
          !targetParticipant
        ) {
          return;
        }

        const validRoles =
          (
            sourceParticipant.role ===
              "broadcaster" &&
            targetParticipant.role ===
              "listener"
          ) ||
          (
            sourceParticipant.role ===
              "listener" &&
            targetParticipant.role ===
              "broadcaster"
          );

        if (!validRoles) {
          return;
        }

        const delivered =
          emitToRadioPeer({
            radioId,

            sourceSocketId:
              socket.id,

            targetSocketId:
              target,

            sourceRole:
              sourceParticipant.role,

            targetRole:
              targetParticipant.role,

            event:
              "radio:ice-candidate",

            payload: {
              candidate,

              senderId:
                socket.id,
            },
          });

        if (!delivered) {
          console.warn(
            "Rejected stale ICE candidate",
            {
              radioId,
              source:
                socket.id,
              target,
            }
          );
        }
      }
    );

    // ==================================================
    // DISCONNECT
    // ==================================================

    socket.on(
      "disconnect",
      () => {
        console.log(
          "Socket disconnected:",
          socket.id
        );

        const memberships =
          removeSocketFromAllRadios(
            socket.id
          );

        for (
          const membership of
          memberships
        ) {
          const {
            radioId,
            participant,
          } =
            membership;

          io.to(
            `radio:${radioId}`
          ).emit(
            "radio:peer-left",
            {
              socketId:
                socket.id,
            }
          );

          if (
            participant.role ===
            "broadcaster"
          ) {
            io.to(
              `radio:${radioId}`
            ).emit(
              "radio:status",
              {
                isLive: false,
              }
            );
          }

          emitRadioStats(
            radioId
          );
        }

        clearSocketRadioState(
          socket
        );
      }
    );
  }
);

httpServer.listen(
  port,
  hostname,
  () => {
    console.log(
      `Server running on http://${hostname}:${port}`
    );
  }
);

await ensureGlobalChatId();


}
);
