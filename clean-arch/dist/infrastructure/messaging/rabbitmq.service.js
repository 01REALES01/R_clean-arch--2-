"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const amqp = require("amqplib");
let RabbitMQService = class RabbitMQService {
    constructor(configService) {
        this.configService = configService;
        this.url = this.configService.get('RABBITMQ_URL') || 'amqp://localhost:5672';
    }
    async onModuleInit() {
        await this.connect();
    }
    async onModuleDestroy() {
        await this.disconnect();
    }
    async connect() {
        try {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();
            console.log('✅ RabbitMQ connected successfully');
        }
        catch (error) {
            console.error('❌ Failed to connect to RabbitMQ:', error.message);
            throw error;
        }
    }
    async disconnect() {
        var _a, _b;
        try {
            await ((_a = this.channel) === null || _a === void 0 ? void 0 : _a.close());
            await ((_b = this.connection) === null || _b === void 0 ? void 0 : _b.close());
            console.log('✅ RabbitMQ disconnected');
        }
        catch (error) {
            console.error('❌ Failed to disconnect from RabbitMQ:', error.message);
        }
    }
    async publish(queue, message) {
        try {
            await this.channel.assertQueue(queue, { durable: true });
            const sent = this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
            if (sent) {
                console.log(`📤 Message published to queue: ${queue}`);
            }
            return sent;
        }
        catch (error) {
            console.error(`❌ Failed to publish message to queue ${queue}:`, error.message);
            throw error;
        }
    }
    async consume(queue, callback) {
        try {
            await this.channel.assertQueue(queue, { durable: true });
            this.channel.consume(queue, async (msg) => {
                if (msg) {
                    try {
                        const content = JSON.parse(msg.content.toString());
                        console.log(`📥 Message received from queue: ${queue}`);
                        await callback(content);
                        this.channel.ack(msg);
                    }
                    catch (error) {
                        console.error(`❌ Error processing message:`, error.message);
                        this.channel.nack(msg, false, false);
                    }
                }
            });
            console.log(`👂 Listening to queue: ${queue}`);
        }
        catch (error) {
            console.error(`❌ Failed to consume from queue ${queue}:`, error.message);
            throw error;
        }
    }
    getChannel() {
        return this.channel;
    }
};
exports.RabbitMQService = RabbitMQService;
exports.RabbitMQService = RabbitMQService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RabbitMQService);
//# sourceMappingURL=rabbitmq.service.js.map