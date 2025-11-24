import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly url: string;
  private readonly logger = new Logger(RabbitMQService.name);
  private isConnected = false;
  private reconnectTimeout: NodeJS.Timeout;

  constructor(private readonly configService: ConfigService) {
    this.url = this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connectWithRetry(): Promise<void> {
    try {
      this.logger.log(`Attempting to connect to RabbitMQ at ${this.url}`);
      this.connection = await amqp.connect(this.url);

      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error', err);
        this.handleDisconnect();
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
        this.handleDisconnect();
      });

      this.channel = await this.connection.createChannel();
      this.isConnected = true;
      this.logger.log('✅ RabbitMQ connected successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to RabbitMQ:', error.message);
      this.handleDisconnect();
    }
  }

  private handleDisconnect() {
    this.isConnected = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.logger.log('Reconnecting in 5 seconds...');
    this.reconnectTimeout = setTimeout(() => {
      this.connectWithRetry();
    }, 5000);
  }

  private async disconnect(): Promise<void> {
    try {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      await this.channel?.close();
      await this.connection?.close();
      this.logger.log('✅ RabbitMQ disconnected');
    } catch (error) {
      this.logger.error('❌ Failed to disconnect from RabbitMQ:', error.message);
    }
  }

  async publish(queue: string, message: any): Promise<boolean> {
    if (!this.isConnected) {
      this.logger.warn(`Cannot publish to ${queue}: RabbitMQ not connected`);
      return false;
    }

    try {
      await this.channel.assertQueue(queue, { durable: true });
      const sent = this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );

      if (sent) {
        this.logger.debug(`📤 Message published to queue: ${queue}`);
      }

      return sent;
    } catch (error) {
      this.logger.error(`❌ Failed to publish message to queue ${queue}:`, error.message);
      return false;
    }
  }

  async consume(queue: string, callback: (message: any) => Promise<void>): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn(`Cannot consume from ${queue}: RabbitMQ not connected. Retrying in 5s...`);
      setTimeout(() => this.consume(queue, callback), 5000);
      return;
    }

    try {
      await this.channel.assertQueue(queue, { durable: true });

      this.channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            this.logger.debug(`📥 Message received from queue: ${queue}`);

            await callback(content);

            this.channel.ack(msg);
          } catch (error) {
            this.logger.error(`❌ Error processing message:`, error.message);
            this.channel.nack(msg, false, false);
          }
        }
      });

      this.logger.log(`👂 Listening to queue: ${queue}`);
    } catch (error) {
      this.logger.error(`❌ Failed to consume from queue ${queue}:`, error.message);
    }
  }

  getChannel(): amqp.Channel {
    return this.channel;
  }
}
