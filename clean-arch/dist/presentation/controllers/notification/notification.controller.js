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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../infrastructure/auth/guards/jwt-auth.guard");
const get_notifications_use_case_1 = require("../../../application/use-cases/notification/get-notifications.use-case");
const mark_notification_read_use_case_1 = require("../../../application/use-cases/notification/mark-notification-read.use-case");
const get_unread_count_use_case_1 = require("../../../application/use-cases/notification/get-unread-count.use-case");
const delete_notification_use_case_1 = require("../../../application/use-cases/notification/delete-notification.use-case");
const notification_entity_1 = require("../../../domain/entities/notification.entity");
const notification_response_dto_1 = require("../../dto/notification/notification-response.dto");
let NotificationController = class NotificationController {
    constructor(getNotificationsUseCase, markNotificationReadUseCase, getUnreadCountUseCase, deleteNotificationUseCase) {
        this.getNotificationsUseCase = getNotificationsUseCase;
        this.markNotificationReadUseCase = markNotificationReadUseCase;
        this.getUnreadCountUseCase = getUnreadCountUseCase;
        this.deleteNotificationUseCase = deleteNotificationUseCase;
    }
    async findAll(req, status) {
        return this.getNotificationsUseCase.execute(req.user.id, status);
    }
    async getUnreadCount(req) {
        const count = await this.getUnreadCountUseCase.execute(req.user.id);
        return { count };
    }
    async markAsRead(id, req) {
        return this.markNotificationReadUseCase.execute(id, req.user.id);
    }
    async remove(id, req) {
        await this.deleteNotificationUseCase.execute(id, req.user.id);
        return { message: 'Notification deleted successfully' };
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all notifications for the authenticated user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notifications retrieved successfully',
        type: [notification_response_dto_1.NotificationResponseDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: notification_entity_1.NotificationStatus, required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get count of unread notifications' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Unread count retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                count: { type: 'number', example: 5 }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notification marked as read',
        type: notification_response_dto_1.NotificationResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "remove", null);
exports.NotificationController = NotificationController = __decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [get_notifications_use_case_1.GetNotificationsUseCase,
        mark_notification_read_use_case_1.MarkNotificationReadUseCase,
        get_unread_count_use_case_1.GetUnreadCountUseCase,
        delete_notification_use_case_1.DeleteNotificationUseCase])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map