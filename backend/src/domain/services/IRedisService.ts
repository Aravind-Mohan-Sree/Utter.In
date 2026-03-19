export interface IRedisService {
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    get(key: string): Promise<string | null>;
    delete(key: string): Promise<void>;
    storeOtp(email: string, otp: string, ttlSeconds: number): Promise<void>;
    getOtp(email: string): Promise<string | null>;
    deleteOtp(email: string): Promise<void>;
    getOtpTtl(email: string): Promise<number>;
}
