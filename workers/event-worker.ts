#!/usr/bin/env node

import { createClient } from "redis";
import { initIO, getIO } from "@/lib/io";

// Simple worker that subscribes to events and forwards to socket.io rooms
async function main() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.error("REDIS_URL is required for worker");
    process.exit(1);
  }

  const sub = createClient({ url: redisUrl });
  await sub.connect();
  await sub.subscribe("post.created", async (message) => {
    try {
      const payload = JSON.parse(message);
      const io = await initIO();
      // emit to church room
      io.to(`church:${payload.churchId}`).emit("post:created", payload);
    } catch (err) {
      console.error("worker: failed to handle post.created", err);
    }
  });

  console.log("Worker subscribed to channels");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
