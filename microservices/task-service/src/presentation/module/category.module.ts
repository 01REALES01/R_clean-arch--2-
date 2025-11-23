import { Module } from '@nestjs/common';
import { CategoryController } from '../controllers/category/category.controller';
import { CreateCategoryUseCase } from '../../application/use-cases/category/create-category.use-case';
import { GetUserCategoriesUseCase } from '../../application/use-cases/category/get-user-categories.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/category/delete-category.use-case';
import { PrismaCategoryRepository } from '../../infrastructure/database/repositories/prisma-category.repository';
import { CATEGORY_REPOSITORY } from '../../application/tokens/repository.tokens';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
    controllers: [CategoryController],
    providers: [
        PrismaService,
        {
            provide: CATEGORY_REPOSITORY,
            useClass: PrismaCategoryRepository,
        },
        CreateCategoryUseCase,
        GetUserCategoriesUseCase,
        DeleteCategoryUseCase,
    ],
    exports: [CATEGORY_REPOSITORY],
})
export class CategoryModule { }
