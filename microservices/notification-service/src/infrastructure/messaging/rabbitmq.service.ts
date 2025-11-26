import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly url: string;
  private connectionPromise: Promise<void>;

  constructor(private readonly configService: ConfigService) {
    this.url = this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
  }

  async onModuleInit() {
    this.connectionPromise = this.connect();
    await this.connectionPromise;
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.url, {
        socketOptions: {
          family: 4 // Force IPv4
        }
      });
      this.channel = await this.connection.createChannel();
      console.log('✅ RabbitMQ connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error.message);
      // Don't throw - allow app to start without RabbitMQ
      console.log('⚠️  App will continue without RabbitMQ messaging');
    }
  }

  private async ensureConnection(): Promise<void> {
    if (this.connectionPromise) {
      await this.connectionPromise;
    }
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not available');
    }
  }

  private async disconnect(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
      console.log('✅ RabbitMQ disconnected');
    } catch (error) {
      console.error('❌ Failed to disconnect from RabbitMQ:', error.message);
    }
  }

  async publish(queue: string, message: any): Promise<boolean> {
    try {
      await this.ensureConnection();
      await this.channel.assertQueue(queue, { durable: true });
      const sent = this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );

      if (sent) {
        console.log(`📤 Message published to queue: ${queue}`);
      }

      return sent;
    } catch (error) {
      console.error(`❌ Failed to publish message to queue ${queue}:`, error.message);
      return false;
    }
  }

  async consume(queue: string, callback: (message: any) => Promise<void>): Promise<void> {
    try {
      await this.ensureConnection();
      await this.channel.assertQueue(queue, { durable: true });

      this.channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            console.log(`📥 Message received from queue: ${queue}`);

            await callback(content);

            this.channel.ack(msg);
          } catch (error) {
            console.error(`❌ Error processing message:`, error.message);
            this.channel.nack(msg, false, false);
          }
        }
      });

      console.log(`👂 Listening to queue: ${queue}`);
    } catch (error) {
      console.error(`❌ Failed to consume from queue ${queue}:`, error.message);
      console.log('⚠️  Event consumption will be disabled');
    }
  }

  getChannel(): amqp.Channel {
    return this.channel;
  }
}
