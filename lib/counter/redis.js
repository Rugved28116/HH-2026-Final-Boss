import { Redis } from '@upstash/redis';

export const COUNTER_KEY = 'hhgoa2026:frames_created';
export const RATE_LIMIT = 10;
export const RATE_WINDOW_SECONDS = 60;
export const rateLimitKey = (ip) => `hhgoa2026:rl:${ip}`;

let client;

// Local fallback memory store for dev/offline mode
let localMemoryCount = 1420;

export function getRedis() {
  if (client !== undefined) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  client = url && token ? new Redis({ url, token }) : null;
  return client;
}

export function getLocalMemoryCount() {
  return localMemoryCount;
}

export function incrementLocalMemoryCount() {
  localMemoryCount += 1;
  return localMemoryCount;
}

export function clientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
