import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private isConfigured: boolean = false;

  constructor(private readonly configService: ConfigService) {
    this.setupTransporter();
  }

  private setupTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    // Check if email is configured
    if (!host || !user || !pass) {
      console.log('⚠️  Email not configured - emails will be skipped');
      console.log('   Add SMTP_HOST, SMTP_USER, SMTP_PASS to .env to enable emails');
      this.isConfigured = false;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: port || 587,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    this.isConfigured = true;
    console.log('✅ Email service configured');
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<boolean> {
    // Skip if not configured
    if (!this.isConfigured) {
      console.log(`📧 Email skipped (not configured): ${options.subject} to ${options.to}`);
      return false;
    }

    try {
      const from = this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_USER');

      await this.transporter.sendMail({
        from: `"TaskFlow Notifications" <${from}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || this.generateHtml(options.text),
      });

      console.log(`✅ Email sent: ${options.subject} to ${options.to}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send email: ${error.message}`);
      return false;
    }
  }

  private generateHtml(text: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4a90e2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 TaskFlow</h1>
            </div>
            <div class="content">
              <p>${text.replace(/\n/g, '<br>')}</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from TaskFlow</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async sendTaskNotification(options: {
    userEmail: string;
    title: string;
    message: string;
    taskDetails?: any;
  }): Promise<boolean> {
    const { userEmail, title, message, taskDetails } = options;

    let text = `${message}\n\n`;
    if (taskDetails) {
      text += `Task Details:\n`;
      text += `- Task ID: ${taskDetails.taskId}\n`;
      if (taskDetails.dueDate) {
        text += `- Due Date: ${new Date(taskDetails.dueDate).toLocaleDateString()}\n`;
      }
      if (taskDetails.status) {
        text += `- Status: ${taskDetails.status}\n`;
      }
    }

    return this.sendEmail({
      to: userEmail,
      subject: `TaskFlow: ${title}`,
      text,
    });
  }
}

