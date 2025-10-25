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
exports.PrismaTaskRepository = void 0;
const common_1 = require("@nestjs/common");
const task_entity_1 = require("../../../domain/entities/task.entity");
const prisma_service_1 = require("../prisma.service");
let PrismaTaskRepository = class PrismaTaskRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    toDomain(prismaTask) {
        return new task_entity_1.Task(prismaTask.id, prismaTask.title, prismaTask.description, prismaTask.status, prismaTask.priority, prismaTask.dueDate, prismaTask.userId, prismaTask.createdAt, prismaTask.updatedAt);
    }
    async create(task) {
        const createdTask = await this.prisma.task.create({
            data: {
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                userId: task.userId,
            },
        });
        return this.toDomain(createdTask);
    }
    async findById(id) {
        const task = await this.prisma.task.findUnique({
            where: { id },
        });
        return task ? this.toDomain(task) : null;
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
            where.dueDate = {};
            if (filters.fromDate) {
                where.dueDate.gte = filters.fromDate;
            }
            if (filters.toDate) {
                where.dueDate.lte = filters.toDate;
            }
        }
        const tasks = await this.prisma.task.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return tasks.map((task) => this.toDomain(task));
    }
    async findByUserId(userId) {
        const tasks = await this.prisma.task.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return tasks.map((task) => this.toDomain(task));
    }
    async update(task) {
        const updatedTask = await this.prisma.task.update({
            where: { id: task.id },
            data: {
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                updatedAt: task.updatedAt,
            },
        });
        return this.toDomain(updatedTask);
    }
    async delete(id) {
        await this.prisma.task.delete({
            where: { id },
        });
    }
};
exports.PrismaTaskRepository = PrismaTaskRepository;
exports.PrismaTaskRepository = PrismaTaskRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTaskRepository);
//# sourceMappingURL=prisma-task.repository.js.map