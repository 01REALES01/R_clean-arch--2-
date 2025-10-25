"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.NotificationStatus = exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["TASK_CREATED"] = "TASK_CREATED";
    NotificationType["TASK_UPDATED"] = "TASK_UPDATED";
    NotificationType["TASK_DELETED"] = "TASK_DELETED";
    NotificationType["TASK_DUE_SOON"] = "TASK_DUE_SOON";
    NotificationType["TASK_OVERDUE"] = "TASK_OVERDUE";
    NotificationType["DAILY_SUMMARY"] = "DAILY_SUMMARY";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "PENDING";
    NotificationStatus["READ"] = "READ";
    NotificationStatus["SENT"] = "SENT";
    NotificationStatus["FAILED"] = "FAILED";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
class Notification {
    constructor(id, userId, type, title, message, status, metadata, createdAt, sentAt) {
        this.id = id;
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.status = status;
        this.metadata = metadata;
        this.createdAt = createdAt;
        this.sentAt = sentAt;
    }
    static create(props) {
        const now = new Date();
        return new Notification(props.id || '', props.userId, props.type, props.title, props.message, props.status || NotificationStatus.PENDING, props.metadata || {}, props.createdAt || now, props.sentAt || null);
    }
    markAsRead() {
        this.status = NotificationStatus.READ;
    }
    markAsSent() {
        this.status = NotificationStatus.SENT;
        this.sentAt = new Date();
    }
    markAsFailed() {
        this.status = NotificationStatus.FAILED;
    }
}
exports.Notification = Notification;
//# sourceMappingURL=notification.entity.js.map