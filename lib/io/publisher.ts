import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
export const redis = createClient({ url: redisUrl });

redis.on("error", (err) => console.error("Redis error", err));

export async function publishEvent(channel: string, payload: any) {
  if (!redis.isOpen) await redis.connect();
  await redis.publish(channel, JSON.stringify(payload));
}
