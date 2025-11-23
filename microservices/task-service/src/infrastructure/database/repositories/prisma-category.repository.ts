import { Injectable } from '@nestjs/common';
import { Category } from '../../../domain/entities/category.entity';
import { CategoryRepository } from '../../../domain/repositories/category.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
    constructor(private readonly prisma: PrismaService) { }

    private toDomain(prismaCategory: any): Category {
        return new Category(
            prismaCategory.id,
            prismaCategory.name,
            prismaCategory.color,
            prismaCategory.icon,
            prismaCategory.userId,
            prismaCategory.createdAt,
            prismaCategory.updatedAt,
        );
    }

    async create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
        const createdCategory = await this.prisma.category.create({
            data: {
                name: category.name,
                color: category.color,
                icon: category.icon,
                userId: category.userId,
            },
        });
        return this.toDomain(createdCategory);
    }

    async findById(id: string): Promise<Category | null> {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });
        return category ? this.toDomain(category) : null;
    }

    async findByUserId(userId: string): Promise<Category[]> {
        const categories = await this.prisma.category.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return categories.map((c) => this.toDomain(c));
    }

    async update(category: Category): Promise<Category> {
        const updatedCategory = await this.prisma.category.update({
            where: { id: category.id },
            data: {
                name: category.name,
                color: category.color,
                icon: category.icon,
            },
        });
        return this.toDomain(updatedCategory);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.category.delete({
            where: { id },
        });
    }
}
