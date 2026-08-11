import { NextResponse } from 'next/server';
import {
  COUNTER_KEY,
  RATE_LIMIT,
  RATE_WINDOW_SECONDS,
  clientIp,
  getLocalMemoryCount,
  getRedis,
  incrementLocalMemoryCount,
  rateLimitKey,
} from '@/lib/counter/redis';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const redis = getRedis();
  if (!redis) {
    // Local dev fallback: increment local memory count cleanly
    const count = incrementLocalMemoryCount();
    return NextResponse.json({ count });
  }

  try {
    const key = rateLimitKey(clientIp(request));
    const hits = await redis.incr(key);
    if (hits === 1) {
      await redis.expire(key, RATE_WINDOW_SECONDS);
    }

    if (hits > RATE_LIMIT) {
      const raw = await redis.get(COUNTER_KEY);
      const current = raw === null || raw === undefined ? 0 : Number(raw);
      return NextResponse.json(
        Number.isFinite(current) ? { count: current, limited: true } : { limited: true },
        { status: 429 }
      );
    }

    const count = await redis.incr(COUNTER_KEY);
    return NextResponse.json({ count });
  } catch {
    const count = incrementLocalMemoryCount();
    return NextResponse.json({ count });
  }
}
