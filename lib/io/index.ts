import { createAdapter } from "@socket.io/redis-adapter";
import { createServer } from "http";
import { Server } from "socket.io";

let io: Server | null = null;

export async function initIO(server?: any) {
  if (io) return io;

  const httpServer = server || createServer();
  io = new Server(httpServer, { path: "/socket.io" });

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      const { createClient } = await import("redis");
      const pubClient = createClient({ url: redisUrl });
      const subClient = pubClient.duplicate();
      await pubClient.connect();
      await subClient.connect();
      const adapter = createAdapter(pubClient, subClient);
      io.adapter(adapter as any);
      console.log("Socket.IO Redis adapter enabled");
    } catch (err) {
      console.warn("Failed to init Redis adapter", err);
    }
  } else {
    console.log("Redis not configured — running in single node mode");
  }

  // basic connection handler
  io.on("connection", (socket) => {
    console.log("socket connected", socket.id);
    socket.on("joinChurch", (churchId: string) => {
      socket.join(`church:${churchId}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("IO not initialized");
  return io;
}
