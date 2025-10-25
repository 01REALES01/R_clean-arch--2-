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
exports.PrismaUserRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let PrismaUserRepository = class PrismaUserRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    toDomain(prismaUser) {
        return {
            id: prismaUser.id,
            email: prismaUser.email,
            password: prismaUser.password,
            role: prismaUser.role,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
        };
    }
    async create(user) {
        const createdUser = await this.prisma.user.create({
            data: {
                email: user.email,
                password: user.password,
                role: user.role,
            },
        });
        return this.toDomain(createdUser);
    }
    async findByEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        return user ? this.toDomain(user) : null;
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        return user ? this.toDomain(user) : null;
    }
    async update(user) {
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                email: user.email,
                password: user.password,
                role: user.role,
            },
        });
        return this.toDomain(updatedUser);
    }
    async delete(id) {
        await this.prisma.user.delete({
            where: { id },
        });
    }
};
exports.PrismaUserRepository = PrismaUserRepository;
exports.PrismaUserRepository = PrismaUserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaUserRepository);
//# sourceMappingURL=prisma-user.repository.js.map