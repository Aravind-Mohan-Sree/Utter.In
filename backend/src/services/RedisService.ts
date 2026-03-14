import { createClient } from 'redis';
import { IRedisService } from '~service-interfaces/IRedisService';
import { logger } from '~logger/logger';
import { env } from '~config/env';

export class RedisService implements IRedisService {
    private _client;

    constructor() {
        this._client = createClient({
            url: env.REDIS_URL,
        });

        this._client.on('error', (err) => logger.error('Redis Client Error', err));
        this._client.on('connect', () => logger.info('Redis Client Connected'));

        this._client.connect().catch((err) => logger.error('Redis Connect Error', err));
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
}
