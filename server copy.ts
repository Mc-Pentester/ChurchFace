import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma";
import { setSocketServer } from "./lib/io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

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

app.prepare().then(async () => {
  const httpServer = createServer(handle);

  const io = new Server(httpServer, {
    cors: { origin: "*" },
    path: "/socket.io",
  });
  setSocketServer(io);

  async function updateListenerCount(radioId: string, delta: number) {
    try {
      const updated = await prisma.radio.update({
        where: { id: radioId },
        data: { listenerCount: { increment: delta } },
      });
      const peak = Math.max(updated.peakListeners, updated.listenerCount);
      if (peak > updated.peakListeners) {
        await prisma.radio.update({
          where: { id: radioId },
          data: { peakListeners: peak },
        });
      }
      const stats = {
        listenerCount: Math.max(0, updated.listenerCount),
        peakListeners: peak,
      };
      io.to(`radio:${radioId}`).emit("radio:stats", stats);
      io.to(`studio:${radioId}`).emit("radio:stats", stats);
    } catch (err) {
      console.error("Listener count update error:", err);
    }
  }

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // --- Chat Global (app/chat/page.tsx) ---
    socket.on("chat:new", async (msg: { user: string; content: string; userId?: string }) => {
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

        const broadcast = {
          id: saved.id,
          user: saved.sender?.name || msg.user || "Anonyme",
          userId: saved.senderId,
          content: saved.content,
          createdAt: saved.createdAt,
        };

        io.emit("chat:new", broadcast);
      } catch (err) {
        console.error("Failed to save message:", err);
      }
    });

    // --- Chat Privé / ChatBox ---
    socket.on("chat:join", (roomChatId: string) => {
      socket.join(roomChatId);
      console.log(`Socket ${socket.id} joined chat ${roomChatId}`);
    });

    socket.on("message:send", async (msg: { chatId: string; senderId: string; content: string }) => {
      try {
        const saved = await prisma.message.create({
          data: {
            content: msg.content,
            chatId: msg.chatId,
            senderId: msg.senderId,
          },
          include: {
            sender: { select: { name: true, image: true } },
          },
        });

        const broadcast = {
          id: saved.id,
          senderId: saved.senderId,
          senderName: saved.sender?.name || "Utilisateur",
          content: saved.content,
          createdAt: saved.createdAt,
        };

        io.to(msg.chatId).emit("message:new", broadcast);
      } catch (err) {
        console.error("Failed to save private message:", err);
      }
    });

    socket.on("typing", ({ chatId: room, userId, isTyping }: { chatId: string; userId: string; isTyping: boolean }) => {
      socket.to(room).emit("typing:update", { userId, isTyping });
    });

    socket.on("message:seen", async ({ chatId: room, userId }: { chatId: string; userId: string }) => {
      try {
        const unseen = await prisma.message.findMany({
          where: { chatId: room, senderId: { not: userId } },
          select: { id: true },
        });

        for (const msg of unseen) {
          await prisma.messageSeen.upsert({
            where: { messageId_userId: { messageId: msg.id, userId } },
            create: { messageId: msg.id, userId },
            update: {},
          });
        }

        io.to(room).emit("message:seen", { userId, chatId: room });
      } catch (err) {
        console.error("Failed to mark messages as seen:", err);
      }
    });

    // --- WebRTC Signaling (Live Streams) ---
    socket.on("stream:join", (streamId: string) => {
      socket.join(`stream:${streamId}`);
      socket.to(`stream:${streamId}`).emit("stream:viewer-joined", socket.id);
      console.log(`Socket ${socket.id} joined stream ${streamId}`);
    });

    socket.on("stream:offer", (payload: { streamId: string; offer: RTCSessionDescriptionInit; target?: string }) => {
      if (payload.target) {
        io.to(payload.target).emit("stream:offer", {
          offer: payload.offer,
          senderId: socket.id,
        });
      } else {
        socket.to(`stream:${payload.streamId}`).emit("stream:offer", {
          offer: payload.offer,
          senderId: socket.id,
        });
      }
    });

    socket.on("stream:answer", (payload: { streamId: string; answer: RTCSessionDescriptionInit; target: string }) => {
      io.to(payload.target).emit("stream:answer", {
        answer: payload.answer,
        senderId: socket.id,
      });
    });

    socket.on("stream:ice-candidate", (payload: { streamId: string; candidate: RTCIceCandidateInit; target?: string }) => {
      if (payload.target) {
        io.to(payload.target).emit("stream:ice-candidate", {
          candidate: payload.candidate,
          senderId: socket.id,
        });
      } else {
        socket.to(`stream:${payload.streamId}`).emit("stream:ice-candidate", {
          candidate: payload.candidate,
          senderId: socket.id,
        });
      }
    });

    socket.on("stream:chat", ({ streamId, msg }: { streamId: string; msg: any }) => {
      io.to(`stream:${streamId}`).emit("stream:chat", msg);
    });

    socket.on("stream:leave", (streamId: string) => {
      socket.leave(`stream:${streamId}`);
      socket.to(`stream:${streamId}`).emit("stream:viewer-left", socket.id);
    });

    // --- Radio WebRTC Signaling ---
    socket.on("radio:broadcast-join", (radioId: string) => {
      socket.join(`radio:${radioId}`);
      socket.data.radioBroadcastId = radioId;
      socket.data.isRadioBroadcaster = true;
      console.log(`Socket ${socket.id} broadcasting radio ${radioId}`);
    });

    socket.on("radio:broadcast-leave", (radioId: string) => {
      socket.leave(`radio:${radioId}`);
      socket.data.radioBroadcastId = undefined;
      socket.data.isRadioBroadcaster = false;
      console.log(`Socket ${socket.id} stopped broadcasting radio ${radioId}`);
    });

    socket.on("radio:request-offer", (radioId: string) => {
      io.to(`studio:${radioId}`).emit("radio:listener-joined", socket.id);
    });

    socket.on("radio:join", (radioId: string) => {
      socket.join(`radio:${radioId}`);
      socket.data.radioId = radioId;
      if (!socket.data.isRadioBroadcaster) {
        updateListenerCount(radioId, 1);
      }
      io.to(`studio:${radioId}`).emit("radio:listener-joined", socket.id);
      console.log(`Socket ${socket.id} joined radio ${radioId}`);
    });

    socket.on("radio:offer", (payload: { radioId: string; offer: RTCSessionDescriptionInit; target?: string }) => {
      if (payload.target) {
        io.to(payload.target).emit("radio:offer", {
          offer: payload.offer,
          senderId: socket.id,
        });
      } else {
        socket.to(`radio:${payload.radioId}`).emit("radio:offer", {
          offer: payload.offer,
          senderId: socket.id,
        });
      }
    });

    socket.on("radio:answer", (payload: { radioId: string; answer: RTCSessionDescriptionInit; target: string }) => {
      io.to(payload.target).emit("radio:answer", {
        answer: payload.answer,
        senderId: socket.id,
      });
    });

    socket.on("radio:ice-candidate", (payload: { radioId: string; candidate: RTCIceCandidateInit; target?: string }) => {
      if (payload.target) {
        io.to(payload.target).emit("radio:ice-candidate", {
          candidate: payload.candidate,
          senderId: socket.id,
        });
      } else {
        socket.to(`radio:${payload.radioId}`).emit("radio:ice-candidate", {
          candidate: payload.candidate,
          senderId: socket.id,
        });
      }
    });

    socket.on("radio:chat", ({ radioId, msg }: { radioId: string; msg: any }) => {
      io.to(`radio:${radioId}`).emit("radio:chat", msg);
    });

    socket.on("radio:leave", (radioId: string) => {
      socket.leave(`radio:${radioId}`);
      socket.to(`radio:${radioId}`).emit("radio:listener-left", socket.id);
      if (!socket.data.isRadioBroadcaster) {
        updateListenerCount(radioId, -1);
      }
      if (socket.data.radioId === radioId) socket.data.radioId = undefined;
    });

    // --- Studio Radio Real-time ---
    socket.on("studio:join", (radioId: string) => {
      socket.join(`studio:${radioId}`);
      console.log(`Socket ${socket.id} joined studio ${radioId}`);
    });

    socket.on("studio:leave", (radioId: string) => {
      socket.leave(`studio:${radioId}`);
      console.log(`Socket ${socket.id} left studio ${radioId}`);
    });

    socket.on("studio:broadcast", ({ radioId, data }: { radioId: string; data: any }) => {
      socket.to(`studio:${radioId}`).emit("studio:update", data);
      socket.to(`radio:${radioId}`).emit("radio:update", data);
    });

    socket.on("studio:chat", async ({ radioId, msg }: { radioId: string; msg: any }) => {
      try {
        const saved = await prisma.radioChatMessage.create({
          data: {
            radioId,
            userId: msg.userId || null,
            name: msg.name || "Anonyme",
            content: msg.content,
          },
        });
        io.to(`radio:${radioId}`).emit("radio:chat", saved);
        io.to(`studio:${radioId}`).emit("studio:chat", saved);
      } catch (err) {
        console.error("Studio chat save error:", err);
      }
    });

    socket.on("disconnect", () => {
      const radioId = socket.data.radioId as string | undefined;
      if (radioId && !socket.data.isRadioBroadcaster) {
        updateListenerCount(radioId, -1);
      }
      console.log("Socket disconnected:", socket.id);
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`Server ready on http://${hostname}:${port}`);
  });

  ensureGlobalChatId().catch((err) => {
    console.error("Global chat init failed (will retry on demand):", err);
  });
}).catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
