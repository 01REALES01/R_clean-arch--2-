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
exports.PrismaNotificationRepository = void 0;
const common_1 = require("@nestjs/common");
const notification_entity_1 = require("../../../domain/entities/notification.entity");
const prisma_service_1 = require("../prisma.service");
let PrismaNotificationRepository = class PrismaNotificationRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    toDomain(prismaNotification) {
        return new notification_entity_1.Notification(prismaNotification.id, prismaNotification.userId, prismaNotification.type, prismaNotification.title, prismaNotification.message, prismaNotification.status, typeof prismaNotification.metadata === 'string'
            ? JSON.parse(prismaNotification.metadata)
            : prismaNotification.metadata, prismaNotification.createdAt, prismaNotification.sentAt);
    }
    async create(notification) {
        const createdNotification = await this.prisma.notification.create({
            data: {
                userId: notification.userId,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                status: notification.status,
                metadata: notification.metadata,
                sentAt: notification.sentAt,
            },
        });
        return this.toDomain(createdNotification);
    }
    async findById(id) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });
        return notification ? this.toDomain(notification) : null;
    }
    async findAll(filters) {
        const where = {};
        if (filters === null || filters === void 0 ? void 0 : filters.userId) {
            where.userId = filters.userId;
        }
        if (filters === null || filters === void 0 ? void 0 : filters.status) {
            where.status = filters.status;
        }
        if ((filters === null || filters === void 0 ? void 0 : filters.fromDate) || (filters === null || filters === void 0 ? void 0 : filters.toDate)) {
            where.createdAt = {};
            if (filters.fromDate) {
                where.createdAt.gte = filters.fromDate;
            }
            if (filters.toDate) {
                where.createdAt.lte = filters.toDate;
            }
        }
        const notifications = await this.prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return notifications.map((notification) => this.toDomain(notification));
    }
    async findByUserId(userId) {
        const notifications = await this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return notifications.map((notification) => this.toDomain(notification));
    }
    async update(notification) {
        const updatedNotification = await this.prisma.notification.update({
            where: { id: notification.id },
            data: {
                status: notification.status,
                sentAt: notification.sentAt,
            },
        });
        return this.toDomain(updatedNotification);
    }
    async delete(id) {
        await this.prisma.notification.delete({
            where: { id },
        });
    }
};
exports.PrismaNotificationRepository = PrismaNotificationRepository;
exports.PrismaNotificationRepository = PrismaNotificationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaNotificationRepository);
//# sourceMappingURL=prisma-notification.repository.js.map