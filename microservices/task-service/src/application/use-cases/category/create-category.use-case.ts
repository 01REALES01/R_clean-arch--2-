import { Injectable, Inject } from '@nestjs/common';
import { Category } from '../../../domain/entities/category.entity';
import { CategoryRepository } from '../../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../tokens/repository.tokens';

@Injectable()
export class CreateCategoryUseCase {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: CategoryRepository,
    ) { }

    async execute(data: {
        name: string;
        color: string;
        icon: string;
        userId: string;
    }): Promise<Category> {
        return this.categoryRepository.create(data);
    }
}
