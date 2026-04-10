import { createClient } from 'redis';
import Redlock, { Lock } from 'redlock';
import { IRedisService, ILock } from '~service-interfaces/IRedisService';
import { logger } from '~logger/logger';
import { env } from '~config/env';

export class RedisService implements IRedisService {
  private _client;
  private _redlock: Redlock;

  constructor() {
    this._client = createClient({
      url: env.REDIS_URL,
    });

    this._client.on('error', (err: Error) => logger.error('Redis Client Error', err));
    this._client.on('connect', () => logger.info('Redis Client Connected'));

    this._client.connect().catch((err: Error) => logger.error('Redis Connect Error', err));

    this._redlock = new Redlock([this._client as unknown], {
      driftFactor: 0.01,
      retryCount: 10,
      retryDelay: 200,
      retryJitter: 200,
      automaticExtensionThreshold: 500,
    });

    this._redlock.on('error', (err: unknown) => {
      if (err instanceof Error && err.name === 'ExecutionError') {
        return;
      }
      logger.error('Redlock Error', err);
    });
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this._client.set(key, value, { EX: ttlSeconds });
    } else {
      await this._client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this._client.get(key);
  }

  async setNx(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    const result = await this._client.set(key, value, { NX: true, EX: ttlSeconds });
    return result === 'OK';
  }

  async delete(key: string): Promise<void> {
    await this._client.del(key);
  }

  async storeOtp(email: string, otp: string, ttlSeconds: number): Promise<void> {
    await this.set(email, otp, ttlSeconds);
  }

  async getOtp(email: string): Promise<string | null> {
    return await this.get(email);
  }

  async deleteOtp(email: string): Promise<void> {
    await this.delete(email);
  }

  async getOtpTtl(email: string): Promise<number> {
    return await this._client.ttl(email);
  }

  async acquireLock(resource: string, ttl: number): Promise<ILock> {
    const lock = await this._redlock.acquire([resource], ttl);
    return lock as unknown as ILock;
  }

  async releaseLock(lock: ILock): Promise<void> {
    try {
      await (lock as unknown as Lock).release();
    } catch (error) {
      if (error instanceof Error && error.name === 'ExecutionError') {
        return;
      }
      logger.error('Error releasing lock:', error);
    }
  }
}
