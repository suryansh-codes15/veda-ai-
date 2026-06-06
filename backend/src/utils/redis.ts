import IORedis from 'ioredis';

let redisInstance: IORedis | null = null;

export function getRedis(): IORedis {
  if (!redisInstance) {
    redisInstance = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false,
    });

    redisInstance.on('connect', () => console.log('✅ Redis connected'));
    redisInstance.on('error', (err) => console.error('❌ Redis error:', err.message));
  }

  return redisInstance;
}

export const CACHE_TTL = 60 * 60; // 1 hour

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  try {
    const val = await redis.get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttl = CACHE_TTL): Promise<void> {
  const redis = getRedis();
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (err) {
    console.warn('Cache set failed:', err);
  }
}

export async function cacheDel(key: string): Promise<void> {
  const redis = getRedis();
  try {
    await redis.del(key);
  } catch (err) {
    console.warn('Cache del failed:', err);
  }
}
