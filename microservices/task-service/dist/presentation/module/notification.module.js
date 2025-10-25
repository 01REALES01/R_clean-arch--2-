"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const notification_controller_1 = require("../controllers/notification/notification.controller");
const get_notifications_use_case_1 = require("../../application/use-cases/notification/get-notifications.use-case");
const mark_notification_read_use_case_1 = require("../../application/use-cases/notification/mark-notification-read.use-case");
const get_unread_count_use_case_1 = require("../../application/use-cases/notification/get-unread-count.use-case");
const delete_notification_use_case_1 = require("../../application/use-cases/notification/delete-notification.use-case");
const prisma_notification_repository_1 = require("../../infrastructure/database/repositories/prisma-notification.repository");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const jwt_strategy_1 = require("../../infrastructure/auth/strategies/jwt.strategy");
const repository_tokens_1 = require("../../application/tokens/repository.tokens");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '1h' },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [notification_controller_1.NotificationController],
        providers: [
            get_notifications_use_case_1.GetNotificationsUseCase,
            mark_notification_read_use_case_1.MarkNotificationReadUseCase,
            get_unread_count_use_case_1.GetUnreadCountUseCase,
            delete_notification_use_case_1.DeleteNotificationUseCase,
            {
                provide: repository_tokens_1.NOTIFICATION_REPOSITORY,
                useClass: prisma_notification_repository_1.PrismaNotificationRepository,
            },
            prisma_service_1.PrismaService,
            jwt_strategy_1.JwtStrategy,
        ],
        exports: [
            get_notifications_use_case_1.GetNotificationsUseCase,
            mark_notification_read_use_case_1.MarkNotificationReadUseCase,
            get_unread_count_use_case_1.GetUnreadCountUseCase,
            delete_notification_use_case_1.DeleteNotificationUseCase,
        ],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map