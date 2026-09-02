/**
 * Unified Cache Service
 * Provides sub-millisecond in-memory caching with automatic TTL expiration
 * and seamless fallback support.
 */

class InMemoryCache {
  constructor() {
    this.store = new Map();
    this.ttlMap = new Map();
    
    // Periodically clean up expired keys every 60 seconds
    this.cleanupInterval = setInterval(() => this.purgeExpired(), 60000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  set(key, value, ttlSeconds = 3600) {
    this.store.set(key, JSON.stringify(value));
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.ttlMap.set(key, expiresAt);
  }

  get(key) {
    if (!this.store.has(key)) return null;

    const expiresAt = this.ttlMap.get(key);
    if (expiresAt && Date.now() > expiresAt) {
      this.del(key);
      return null;
    }

    try {
      const data = this.store.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error(`Cache parse error for key ${key}:`, err);
      return null;
    }
  }

  del(key) {
    this.store.delete(key);
    this.ttlMap.delete(key);
  }

  delPattern(pattern) {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.del(key);
      }
    }
  }

  purgeExpired() {
    const now = Date.now();
    for (const [key, expiresAt] of this.ttlMap.entries()) {
      if (now > expiresAt) {
        this.del(key);
      }
    }
  }

  flush() {
    this.store.clear();
    this.ttlMap.clear();
  }
}

export const cacheService = new InMemoryCache();
