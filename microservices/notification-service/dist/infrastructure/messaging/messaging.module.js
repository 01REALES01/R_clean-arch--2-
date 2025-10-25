"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const rabbitmq_service_1 = require("./rabbitmq.service");
const task_event_handler_1 = require("./handlers/task-event.handler");
const repository_tokens_1 = require("../../application/tokens/repository.tokens");
const prisma_notification_repository_1 = require("../database/repositories/prisma-notification.repository");
const prisma_service_1 = require("../database/prisma.service");
let MessagingModule = class MessagingModule {
};
exports.MessagingModule = MessagingModule;
exports.MessagingModule = MessagingModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            rabbitmq_service_1.RabbitMQService,
            prisma_service_1.PrismaService,
            {
                provide: repository_tokens_1.NOTIFICATION_REPOSITORY,
                useClass: prisma_notification_repository_1.PrismaNotificationRepository,
            },
            task_event_handler_1.TaskEventHandler,
        ],
        exports: [rabbitmq_service_1.RabbitMQService],
    })
], MessagingModule);
//# sourceMappingURL=messaging.module.js.map