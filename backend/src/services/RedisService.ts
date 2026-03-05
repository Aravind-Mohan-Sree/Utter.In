import { createClient } from 'redis';
import { IRedisService } from '~service-interfaces/IRedisService';
import { logger } from '~logger/logger';
import { env } from '~config/env';

export class RedisService implements IRedisService {
    private client;

    constructor() {
        this.client = createClient({
            url: env.REDIS_URL,
        });

        this.client.on('error', (err) => logger.error('Redis Client Error', err));
        this.client.on('connect', () => logger.info('Redis Generic Client Connected'));

        this.client.connect().catch((err) => logger.error('Redis Connect Error', err));
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await this.client.set(key, value, { EX: ttlSeconds });
        } else {
            await this.client.set(key, value);
        }
    }

    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    async delete(key: string): Promise<void> {
        await this.client.del(key);
    }
}
