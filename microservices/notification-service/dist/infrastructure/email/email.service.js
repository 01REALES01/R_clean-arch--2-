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
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailService = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.isConfigured = false;
        this.setupTransporter();
    }
    setupTransporter() {
        const host = this.configService.get('SMTP_HOST');
        const port = this.configService.get('SMTP_PORT');
        const user = this.configService.get('SMTP_USER');
        const pass = this.configService.get('SMTP_PASS');
        if (!host || !user || !pass) {
            console.log('⚠️  Email not configured - emails will be skipped');
            console.log('   Add SMTP_HOST, SMTP_USER, SMTP_PASS to .env to enable emails');
            this.isConfigured = false;
            return;
        }
        this.transporter = nodemailer.createTransport({
            host,
            port: port || 587,
            secure: port === 465,
            auth: {
                user,
                pass,
            },
        });
        this.isConfigured = true;
        console.log('✅ Email service configured');
    }
    async sendEmail(options) {
        if (!this.isConfigured) {
            console.log(`📧 Email skipped (not configured): ${options.subject} to ${options.to}`);
            return false;
        }
        try {
            const from = this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER');
            await this.transporter.sendMail({
                from: `"TaskFlow Notifications" <${from}>`,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html || this.generateHtml(options.text),
            });
            console.log(`✅ Email sent: ${options.subject} to ${options.to}`);
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to send email: ${error.message}`);
            return false;
        }
    }
    generateHtml(text) {
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
    async sendTaskNotification(options) {
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
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map