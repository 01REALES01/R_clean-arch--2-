"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = exports.TaskPriority = exports.TaskStatus = void 0;
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "PENDING";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["COMPLETED"] = "COMPLETED";
    TaskStatus["CANCELLED"] = "CANCELLED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "LOW";
    TaskPriority["MEDIUM"] = "MEDIUM";
    TaskPriority["HIGH"] = "HIGH";
    TaskPriority["URGENT"] = "URGENT";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
class Task {
    constructor(id, title, description, status, priority, dueDate, userId, createdAt, updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.dueDate = dueDate;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(props) {
        const now = new Date();
        return new Task(props.id || '', props.title, props.description || null, props.status || TaskStatus.PENDING, props.priority || TaskPriority.MEDIUM, props.dueDate || null, props.userId, props.createdAt || now, props.updatedAt || now);
    }
    markAsCompleted() {
        this.status = TaskStatus.COMPLETED;
        this.updatedAt = new Date();
    }
    markAsInProgress() {
        this.status = TaskStatus.IN_PROGRESS;
        this.updatedAt = new Date();
    }
    cancel() {
        this.status = TaskStatus.CANCELLED;
        this.updatedAt = new Date();
    }
}
exports.Task = Task;
//# sourceMappingURL=task.entity.js.map