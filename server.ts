import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma";
import { setSocketServer } from "./lib/io";
import { sendPushNotification } from "./lib/push/sendPushNotification";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let io: Server;

// -------------------- GLOBAL CHAT --------------------
async function getGlobalChat() {
  let chat = await prisma.chat.findFirst({
    where: { isGroup: true, name: "Chat Global" },
  });

  if (!chat) {
    chat = await prisma.chat.create({
      data: { isGroup: true, name: "Chat Global" },
    });
  }

  return chat;
}

let globalChatId: string | null = null;

async function ensureGlobalChatId(): Promise<string> {
  if (globalChatId) return globalChatId;
  const chat = await getGlobalChat();
  globalChatId = chat.id;
  return globalChatId;
}

// -------------------- 🔔 NOTIFICATIONS CORE --------------------
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
  // 1. SAVE DB (source de vérité)
  const notif = await prisma.notification.create({
    data: {
      userId: toUserId,
      senderId: fromUserId,
      type,
      message,
      entityId,
      entityType,
      data,
    },
  });

  // 2. SOCKET REALTIME (si user connecté)
  io.to(`user:${toUserId}`).emit("notification:new", notif);

  // 3. 🔥 PUSH NOTIFICATION (même si site fermé)
  try {
    await sendPushNotification(toUserId, {
      title: "ChurchFace",
      body: message,
      url: entityId ? `/post/${entityId}` : "/",
      type,
    });
  } catch (err) {
    console.error("Push notification error:", err);
  }

  return notif;
}

// -------------------- INIT --------------------
app.prepare().then(async () => {
  const httpServer = createServer(handle);

  io = new Server(httpServer, {
    cors: { origin: "*" },
    path: "/socket.io",
  });

  setSocketServer(io);

  // -------------------- SOCKET CONNECTION --------------------
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // =========================
    // 🔔 REGISTER USER ROOM
    // =========================
    socket.on("register", (userId: string) => {
      socket.join(`user:${userId}`);
      socket.data.userId = userId;
    });

    // =========================
    // 💬 GLOBAL CHAT
    // =========================
    socket.on("chat:new", async (msg: any) => {
      try {
        const chatId = await ensureGlobalChatId();

        const saved = await prisma.message.create({
          data: {
            content: msg.content,
            chatId,
            senderId: msg.userId || "unknown",
          },
          include: {
            sender: { select: { name: true, image: true } },
          },
        });

        io.emit("chat:new", {
          id: saved.id,
          user: saved.sender?.name || "Anonyme",
          content: saved.content,
          createdAt: saved.createdAt,
        });
      } catch (err) {
        console.error(err);
      }
    });

    // =========================
    // 💬 PRIVATE CHAT
    // =========================
    socket.on("message:send", async (msg: any) => {
      const saved = await prisma.message.create({
        data: {
          content: msg.content,
          chatId: msg.chatId,
          senderId: msg.senderId,
        },
      });

      io.to(msg.chatId).emit("message:new", saved);
    });

    // =========================
    // 🔥 SOCIAL EVENTS (LIKE / COMMENT / FOLLOW)
    // =========================

    socket.on("post:like", async ({ postId, fromUserId, postOwnerId }) => {
      await sendNotification({
        toUserId: postOwnerId,
        fromUserId,
        type: "LIKE",
        message: "a aimé votre publication ❤️",
        entityId: postId,
        entityType: "post",
      });
    });

    socket.on("post:comment", async ({ postId, fromUserId, postOwnerId }) => {
      await sendNotification({
        toUserId: postOwnerId,
        fromUserId,
        type: "COMMENT",
        message: "a commenté votre publication 💬",
        entityId: postId,
        entityType: "post",
      });
    });

    socket.on("user:follow", async ({ fromUserId, toUserId }) => {
      await sendNotification({
        toUserId,
        fromUserId,
        type: "FOLLOW",
        message: "a commencé à vous suivre 👤",
      });
    });

    // =========================
    // 🧠 TYPING
    // =========================
    socket.on("typing", ({ chatId, userId, isTyping }) => {
      socket.to(chatId).emit("typing:update", { userId, isTyping });
    });

    // =========================
    // 👁 SEEN MESSAGES
    // =========================
    socket.on("message:seen", async ({ chatId, userId }) => {
      const unseen = await prisma.message.findMany({
        where: { chatId, senderId: { not: userId } },
        select: { id: true },
      });

      for (const msg of unseen) {
        await prisma.messageSeen.upsert({
          where: {
            messageId_userId: { messageId: msg.id, userId },
          },
          create: { messageId: msg.id, userId },
          update: {},
        });
      }

      io.to(chatId).emit("message:seen", { userId, chatId });
    });

    // =========================
    // 🎥 STREAM (UNCHANGED)
    // =========================
    socket.on("stream:join", (streamId) => {
      socket.join(`stream:${streamId}`);
    });

    socket.on("stream:chat", ({ streamId, msg }) => {
      io.to(`stream:${streamId}`).emit("stream:chat", msg);
    });

    socket.on("stream:leave", (streamId) => {
      socket.leave(`stream:${streamId}`);
    });

    // =========================
    // 📻 RADIO (UNCHANGED CORE)
    // =========================
    socket.on("radio:join", (radioId) => {
      socket.join(`radio:${radioId}`);
      socket.data.radioId = radioId;
    });

    socket.on("radio:leave", (radioId) => {
      socket.leave(`radio:${radioId}`);
    });

    // =========================
    // 🔌 DISCONNECT
    // =========================
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`Server running on http://${hostname}:${port}`);
  });

  ensureGlobalChatId();
});