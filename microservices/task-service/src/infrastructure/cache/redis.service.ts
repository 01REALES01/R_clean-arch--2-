import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: RedisClientType;
    private readonly logger = new Logger(RedisService.name);

    constructor(private readonly configService: ConfigService) {
        const host = this.configService.get<string>('REDIS_HOST') || 'localhost';
        const port = this.configService.get<number>('REDIS_PORT') || 6379;
        const url = `redis://${host}:${port}`;

        this.client = createClient({ url });

        this.client.on('error', (err) => this.logger.error('Redis Client Error', err));
        this.client.on('connect', () => this.logger.log('✅ Redis connected successfully'));
    }

    async onModuleInit() {
        await this.client.connect();
    }

    async onModuleDestroy() {
        await this.client.disconnect();
    }

    async get(key: string): Promise<string | null> {
        const value = await this.client.get(key);
        return value as string | null;
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await this.client.set(key, value, { EX: ttlSeconds });
        } else {
            await this.client.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async delPattern(pattern: string): Promise<void> {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
            await this.client.del(keys);
        }
    }
}
