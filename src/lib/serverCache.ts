import Redis from 'ioredis';

type CacheValue = string;

interface MemoryEntry {
  value: CacheValue;
  expiresAt: number;
}

const REDIS_URL = import.meta.env.REDIS_URL || import.meta.env.REDIS;
const REDIS_PREFIX = import.meta.env.REDIS_CACHE_PREFIX || 'invierta';
const REDIS_RETRY_COOLDOWN_MS = 60_000;
const DEFAULT_TTL_SECONDS = 300;

let redisClient: Redis | null = null;
let redisDisabledUntil = 0;

const memoryCache = new Map<string, MemoryEntry>();

function now(): number {
  return Date.now();
}

function memoryGet(key: string): CacheValue | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= now()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

function memorySet(key: string, value: CacheValue, ttlSeconds: number): void {
  const ttl = Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : DEFAULT_TTL_SECONDS;
  memoryCache.set(key, {
    value,
    expiresAt: now() + ttl * 1000,
  });
}

function getRedisKey(key: string): string {
  return `${REDIS_PREFIX}:${key}`;
}

function getRedisClient(): Redis | null {
  if (!REDIS_URL) return null;
  if (now() < redisDisabledUntil) return null;

  if (!redisClient) {
    redisClient = new Redis(REDIS_URL, {
      lazyConnect: true,
      enableOfflineQueue: false,
      connectTimeout: 2000,
      maxRetriesPerRequest: 1,
    });

    redisClient.on('error', () => {
      redisDisabledUntil = now() + REDIS_RETRY_COOLDOWN_MS;
    });
  }

  return redisClient;
}

export async function readCache<T>(key: string): Promise<T | null> {
  const fromMemory = memoryGet(key);
  if (fromMemory) {
    return JSON.parse(fromMemory) as T;
  }

  const client = getRedisClient();
  if (!client) return null;

  try {
    const value = await client.get(getRedisKey(key));
    if (!value) return null;
    // Keep a short L1 copy to reduce Redis roundtrips on hot keys.
    memorySet(key, value, 30);
    return JSON.parse(value) as T;
  } catch {
    redisDisabledUntil = now() + REDIS_RETRY_COOLDOWN_MS;
    return null;
  }
}

export async function writeCache<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const ttl = Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : DEFAULT_TTL_SECONDS;
  const serialized = JSON.stringify(value);
  memorySet(key, serialized, Math.max(30, ttl));

  const client = getRedisClient();
  if (!client) return;

  try {
    await client.set(getRedisKey(key), serialized, 'EX', ttl);
  } catch {
    redisDisabledUntil = now() + REDIS_RETRY_COOLDOWN_MS;
  }
}
