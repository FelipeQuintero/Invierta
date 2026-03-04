import Redis from 'ioredis';

type CacheValue = string;

interface MemoryEntry {
  value: CacheValue;
  expiresAt: number;
}

interface CacheEnvelope<T> {
  __cacheEnvelope: 1;
  value: T;
  freshUntil: number;
}

export interface CacheReadResult<T> {
  value: T;
  isStale: boolean;
  freshUntil: number;
}

const REDIS_URL = import.meta.env.REDIS_URL || import.meta.env.REDIS;
const REDIS_PREFIX = import.meta.env.REDIS_CACHE_PREFIX || 'invierta';
const REDIS_RETRY_COOLDOWN_MS = 60_000;
const DEFAULT_TTL_SECONDS = 300;
const DEFAULT_STALE_TTL_SECONDS = 900;

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

function normalizeTtl(ttlSeconds: number, fallback: number): number {
  return Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : fallback;
}

function decodeCachePayload<T>(serialized: string): CacheEnvelope<T> | null {
  try {
    const parsed = JSON.parse(serialized);
    if (
      parsed &&
      typeof parsed === 'object' &&
      '__cacheEnvelope' in parsed &&
      parsed.__cacheEnvelope === 1 &&
      'freshUntil' in parsed &&
      typeof parsed.freshUntil === 'number' &&
      'value' in parsed
    ) {
      return parsed as CacheEnvelope<T>;
    }

    // Backward compatibility with legacy payloads.
    return {
      __cacheEnvelope: 1,
      value: parsed as T,
      freshUntil: Number.MAX_SAFE_INTEGER,
    };
  } catch {
    return null;
  }
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

async function readSerializedCache(key: string): Promise<CacheValue | null> {
  const fromMemory = memoryGet(key);
  if (fromMemory) {
    return fromMemory;
  }

  const client = getRedisClient();
  if (!client) return null;

  try {
    const value = await client.get(getRedisKey(key));
    if (!value) return null;
    // Keep a short L1 copy to reduce Redis roundtrips on hot keys.
    memorySet(key, value, 30);
    return value;
  } catch {
    redisDisabledUntil = now() + REDIS_RETRY_COOLDOWN_MS;
    return null;
  }
}

export async function readCacheEntry<T>(key: string): Promise<CacheReadResult<T> | null> {
  const serialized = await readSerializedCache(key);
  if (!serialized) return null;

  const envelope = decodeCachePayload<T>(serialized);
  if (!envelope) return null;

  return {
    value: envelope.value,
    isStale: envelope.freshUntil <= now(),
    freshUntil: envelope.freshUntil,
  };
}

export async function readCache<T>(key: string): Promise<T | null> {
  const entry = await readCacheEntry<T>(key);
  if (!entry || entry.isStale) return null;
  return entry.value;
}

export async function writeCache<T>(
  key: string,
  value: T,
  ttlSeconds: number,
  staleTtlSeconds: number = DEFAULT_STALE_TTL_SECONDS
): Promise<void> {
  const freshTtl = normalizeTtl(ttlSeconds, DEFAULT_TTL_SECONDS);
  const staleTtl = Math.max(0, normalizeTtl(staleTtlSeconds, DEFAULT_STALE_TTL_SECONDS));
  const storageTtl = freshTtl + staleTtl;

  const envelope: CacheEnvelope<T> = {
    __cacheEnvelope: 1,
    value,
    freshUntil: now() + freshTtl * 1000,
  };

  const serialized = JSON.stringify(envelope);
  memorySet(key, serialized, Math.max(30, storageTtl));

  const client = getRedisClient();
  if (!client) return;

  try {
    await client.set(getRedisKey(key), serialized, 'EX', storageTtl);
  } catch {
    redisDisabledUntil = now() + REDIS_RETRY_COOLDOWN_MS;
  }
}
