import { Injectable, Inject } from '@nestjs/common';
import { Category } from '../../../domain/entities/category.entity';
import { CategoryRepository } from '../../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../tokens/repository.tokens';

@Injectable()
export class GetUserCategoriesUseCase {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: CategoryRepository,
    ) { }

    async execute(userId: string): Promise<Category[]> {
        return this.categoryRepository.findByUserId(userId);
    }
}
