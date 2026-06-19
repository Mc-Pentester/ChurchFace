import { Server, Socket } from "socket.io";

export function initSocket(server: any) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  // 👤 userId -> Set(socketId) (multi-device support)
  const onlineUsers = new Map<string, Set<string>>();

  const getOnlineUsers = () => Array.from(onlineUsers.keys());

  io.on("connection", (socket: Socket) => {
    console.log("🟢 connected:", socket.id);

    /* =========================
       🟢 PRESENCE SYSTEM
    ========================== */
    socket.on("user:online", (userId: string) => {
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }

      onlineUsers.get(userId)!.add(socket.id);

      io.emit("presence:update", getOnlineUsers());
    });

    /* =========================
       💬 CHAT ROOMS
    ========================== */
    socket.on("chat:join", (chatId: string) => {
      socket.join(chatId);
    });

    /* =========================
       ✉️ MESSAGES
    ========================== */
    socket.on("message:send", (data, callback) => {
      io.to(data.chatId).emit("message:new", data);

      callback?.({ status: "ok" });
    });

    /* =========================
       ✍️ TYPING
    ========================== */
    socket.on("typing", ({ chatId, userId, isTyping }) => {
      socket.to(chatId).emit("typing:update", {
        userId,
        isTyping,
      });
    });

    /* =========================
       � CALLS (WebRTC)
    ========================== */
    socket.on("call:offer", ({ callId, offer, recipientId, callerId, callType }) => {
      socket.to(recipientId).emit("call:incoming", {
        callId,
        offer,
        callerId,
        callType,
      });
    });

    socket.on("call:answer", ({ callId, answer, recipientId }) => {
      socket.to(recipientId).emit("call:answer", {
        callId,
        answer,
      });
    });

    socket.on("call:ice", ({ callId, candidate, recipientId }) => {
      socket.to(recipientId).emit("call:ice", {
        callId,
        candidate,
      });
    });

    socket.on("call:end", ({ callId, recipientId }) => {
      socket.to(recipientId).emit("call:end", {
        callId,
      });
    });

    /* =========================
       �👀 SEEN (READ RECEIPTS)
    ========================== */
    socket.on("message:seen", ({ chatId, userId, messageId }) => {
      io.to(chatId).emit("message:seen:update", {
        chatId,
        userId,
        messageId,
        seenAt: new Date(),
      });
    });

    /* =========================
       🔥 POSTS (FEED LIVE)
    ========================== */
    socket.on("post:new", (post) => {
      io.emit("post:new", post);
    });

    socket.on("post:like", (data) => {
      io.emit("post:like:update", data);
    });

    socket.on("post:comment:new", (comment) => {
      io.emit("post:comment:new", comment);
    });

    /* =========================
       👀 STORIES
    ========================== */
    socket.on("story:new", (story) => {
      io.emit("story:new", story);
    });

    /* =========================
       🔌 DISCONNECT
    ========================== */
    socket.on("disconnect", () => {
      for (const [userId, sockets] of onlineUsers.entries()) {
        sockets.delete(socket.id);

        if (sockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }

      io.emit("presence:update", getOnlineUsers());

      console.log("🔴 disconnected:", socket.id);
    });
  });

  return io;
}