import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma";
import { setSocketServer } from "./lib/io";
import { sendPushNotification } from "./lib/push/sendPushNotification";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.SERVER_HOST || "0.0.0.0";
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
      metadata: data ?? {},
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

  const allowedOrigins = (
    process.env.SOCKET_CORS_ORIGINS ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (dev ? "http://localhost:3000" : "")
  )
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : false,
      credentials: true,
    },
    path: "/socket.io",
  });

  setSocketServer(io);

  // -------------------- SOCKET CONNECTION --------------------
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Log all incoming events for debugging
    socket.onAny((eventName, ...args) => {
      console.log("Socket event received:", eventName, args);
    });

    // =========================
    // 🔔 REGISTER USER ROOM
    // =========================
    socket.on("register", (userId: string) => {
      socket.join(`user:${userId}`);
      socket.data.userId = userId;
    });

    // =========================
    // ⛪ CHURCH FEED ROOMS
    // =========================
    socket.on("joinChurch", (churchId: string) => {
      if (churchId) socket.join(`church:${churchId}`);
    });

    socket.on("leaveChurch", (churchId: string) => {
      if (churchId) socket.leave(`church:${churchId}`);
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
      console.log("Message received via socket:", msg);
      // Message is already saved in database by API route
      // Just emit to chat room for real-time updates
      io.to(msg.chatId).emit("message:new", msg);
      console.log("Message emitted to chat room:", msg.chatId);
    });

    // =========================
    // 🔥 SOCIAL EVENTS (LIKE / COMMENT / FOLLOW)
    // =========================

    socket.on("post:like", async ({ postId, fromUserId, postOwnerId }) => {
      try {
        await sendNotification({
          toUserId: postOwnerId,
          fromUserId,
          type: "LIKE",
          message: "a aimé votre publication ❤️",
          entityId: postId,
          entityType: "post",
        });
      } catch (err) {
        console.error("post:like notification failed:", err);
      }
    });

    socket.on("post:comment", async ({ postId, fromUserId, postOwnerId }) => {
      try {
        await sendNotification({
          toUserId: postOwnerId,
          fromUserId,
          type: "COMMENT",
          message: "a commenté votre publication 💬",
          entityId: postId,
          entityType: "post",
        });
      } catch (err) {
        console.error("post:comment notification failed:", err);
      }
    });

    socket.on("user:follow", async ({ fromUserId, toUserId }) => {
      try {
        await sendNotification({
          toUserId,
          fromUserId,
          type: "FOLLOW",
          message: "a commencé à vous suivre 👤",
        });
      } catch (err) {
        console.error("user:follow notification failed:", err);
      }
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
      try {
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
      } catch (err) {
        console.error("message:seen handler failed:", err);
      }
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