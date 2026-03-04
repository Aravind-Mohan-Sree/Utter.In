import { createClient } from 'redis';
import { IOtpService } from '~service-interfaces/IOtpService';
import { logger } from '~logger/logger';
import { env } from '~config/env';

export class RedisOtpService implements IOtpService {
    private client;

    constructor() {
        this.client = createClient({
            url: env.REDIS_URL,
        });

        this.client.on('error', (err) => logger.error('Redis Client Error', err));
        this.client.on('connect', () => logger.info('Redis Client Connected'));

        this.client.connect().catch((err) => logger.error('Redis Connect Error', err));
    }

    async storeOtp(email: string, otp: string, ttlSeconds: number): Promise<void> {
        await this.client.set(email, otp, { EX: ttlSeconds });
    }

    async getOtp(email: string): Promise<string | null> {
        return await this.client.get(email);
    }

    async deleteOtp(email: string): Promise<void> {
        await this.client.del(email);
    }

    async getOtpTtl(email: string): Promise<number> {
        return await this.client.ttl(email);
    }
}
