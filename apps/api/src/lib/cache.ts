import Redis from 'ioredis';
import { env } from '../config/env';

// Redis client singleton
let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!env.redisUrl) {
    return null;
  }

  if (!redis) {
    redis = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      console.error('Redis connection error:', err.message);
    });

    redis.on('connect', () => {
      console.log('Redis connected');
    });
  }

  return redis;
}

// Cache service with fallback when Redis is not available
export const cacheService = {
  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  /**
   * Set cached value with optional TTL (in seconds)
   */
  async set(key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
    const client = getRedisClient();
    if (!client) return;

    try {
      await client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  /**
   * Delete cached value
   */
  async del(key: string): Promise<void> {
    const client = getRedisClient();
    if (!client) return;

    try {
      await client.del(key);
    } catch (error) {
      console.error('Cache del error:', error);
    }
  },

  /**
   * Delete all keys matching a pattern
   */
  async delPattern(pattern: string): Promise<void> {
    const client = getRedisClient();
    if (!client) return;

    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch (error) {
      console.error('Cache delPattern error:', error);
    }
  },

  /**
   * Get or set cached value (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetchFn();

    // Cache the result
    await this.set(key, data, ttlSeconds);

    return data;
  },
};

// Cache key generators
export const cacheKeys = {
  // Public store data
  publicStore: (slug: string) => `public:store:${slug}`,
  publicStoreProducts: (slug: string) => `public:store:${slug}:products`,
  publicStoreCategories: (slug: string) => `public:store:${slug}:categories`,

  // Store data (private)
  store: (storeId: string) => `store:${storeId}`,
  storeProducts: (storeId: string) => `store:${storeId}:products`,
  storeCategories: (storeId: string) => `store:${storeId}:categories`,

  // Invalidation patterns
  storePattern: (storeId: string) => `store:${storeId}:*`,
  publicStorePattern: (slug: string) => `public:store:${slug}:*`,
};

// Cache TTLs (in seconds)
export const cacheTTL = {
  publicStore: 60 * 5, // 5 minutes
  publicProducts: 60 * 2, // 2 minutes
  publicCategories: 60 * 5, // 5 minutes
  storeData: 60 * 5, // 5 minutes
};
