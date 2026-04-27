import Redis from 'ioredis';
import Redlock, { Lock } from 'redlock';
import { IRedisService, ILock } from '~service-interfaces/IRedisService';
import { logger } from '~logger/logger';
import { env } from '~config/env';

/**
 * Concrete implementation of IRedisService using ioredis.
 * Provides caching, OTP storage, and distributed locking via Redlock.
 */
export class RedisService implements IRedisService {
  private _client: Redis;
  private _redlock: Redlock;

  constructor() {
    this._client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      family: 4,
      connectTimeout: 10000,
      enableReadyCheck: false,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this._client.on('error', (err: Error) => logger.error('Redis Client Error', err));
    this._client.on('connect', () => logger.info('Redis Client Connected'));

    // Initialize Redlock for distributed locking across multiple Redis instances (or just one here)
    this._redlock = new Redlock([this._client], {
      driftFactor: 0.01,
      retryCount: 10,
      retryDelay: 200,
      retryJitter: 200,
      automaticExtensionThreshold: 500,
    });

    this._redlock.on('error', (err: unknown) => {
      // ExecutionError is common when a lock can't be acquired; we often want to ignore it in logs
      if (err instanceof Error && err.name === 'ExecutionError') {
        return;
      }
      logger.error('Redlock Error', err);
    });
  }

  /**
   * Standard key-value storage with optional TTL.
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this._client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this._client.set(key, value);
    }
  }

  /**
   * Standard key-value retrieval.
   */
  async get(key: string): Promise<string | null> {
    return await this._client.get(key);
  }

  /**
   * Set if Not Exists (Atomic). Returns true if the key was set.
   */
  async setNx(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    const result = await this._client.set(key, value, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  /**
   * Deletes a key.
   */
  async delete(key: string): Promise<void> {
    await this._client.del(key);
  }

  /**
   * Specialized helper to store OTPs.
   */
  async storeOtp(email: string, otp: string, ttlSeconds: number): Promise<void> {
    await this.set(email, otp, ttlSeconds);
  }

  /**
   * Retrieves a stored OTP.
   */
  async getOtp(email: string): Promise<string | null> {
    return await this.get(email);
  }

  /**
   * Deletes a stored OTP.
   */
  async deleteOtp(email: string): Promise<void> {
    await this.delete(email);
  }

  /**
   * Gets the remaining time-to-live for an OTP.
   */
  async getOtpTtl(email: string): Promise<number> {
    return await this._client.ttl(email);
  }

  /**
   * Acquires a distributed lock for a specific resource.
   */
  async acquireLock(resource: string, ttl: number): Promise<ILock> {
    const lock = await this._redlock.acquire([resource], ttl);
    return lock as unknown as ILock;
  }

  /**
   * Releases a previously acquired distributed lock.
   */
  async releaseLock(lock: ILock): Promise<void> {
    await (lock as unknown as Lock).release();
  }
}
