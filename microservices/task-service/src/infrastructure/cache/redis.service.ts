import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import * as dns from 'dns';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: RedisClientType;
    private readonly logger = new Logger(RedisService.name);

    constructor(private readonly configService: ConfigService) {
        const envHost = this.configService.get<string>('REDIS_HOST');
        const envPort = this.configService.get<number>('REDIS_PORT');

        this.logger.log(`[DEBUG] Raw REDIS_HOST from ConfigService: '${envHost}'`);
        this.logger.log(`[DEBUG] Raw REDIS_PORT from ConfigService: '${envPort}'`);
        this.logger.log(`[DEBUG] process.env.REDIS_HOST: '${process.env.REDIS_HOST}'`);

        const host = envHost || 'localhost';
        const port = envPort || 6379;

        // Debug DNS resolution
        dns.lookup(host, (err, address, family) => {
            if (err) {
                this.logger.error(`[DEBUG] DNS lookup failed for ${host}: ${err.message}`);
            } else {
                this.logger.log(`[DEBUG] DNS lookup for ${host}: Address=${address}, Family=IPv${family}`);
            }
        });

        this.logger.log(`Attempting to connect to Redis at ${host}:${port}`);

        this.client = createClient({
            socket: {
                host: host,
                port: port,
                family: 4 // Force IPv4
            }
        });

        this.client.on('error', (err) => this.logger.error('Redis Client Error', err));
        this.client.on('connect', () => this.logger.log('✅ Redis connected successfully'));
        this.client.on('ready', () => this.logger.log('✅ Redis client ready'));
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
