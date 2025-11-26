import { Injectable, Inject } from '@nestjs/common';
import { CategoryRepository } from '../../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../tokens/repository.tokens';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class GetUserCategoriesUseCase {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: CategoryRepository,
        private readonly prisma: PrismaService,
    ) { }

    async execute(userId: string) {
        return this.prisma.category.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { tasks: true }
                }
            }
        });
    }
}
