import { NextResponse } from 'next/server';
import { COUNTER_KEY, getLocalMemoryCount, getRedis } from '@/lib/counter/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const redis = getRedis();
  if (!redis) {
    // Local dev fallback: return memory count cleanly without 503 errors
    return NextResponse.json({ count: getLocalMemoryCount() });
  }

  try {
    const value = await redis.get(COUNTER_KEY);
    if (value === null || value === undefined) {
      return NextResponse.json({ count: 0 });
    }
    const count = Number(value);
    if (!Number.isFinite(count)) {
      return NextResponse.json({ count: getLocalMemoryCount() });
    }
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: getLocalMemoryCount() });
  }
}
