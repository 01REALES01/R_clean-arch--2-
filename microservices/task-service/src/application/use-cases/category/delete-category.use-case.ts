import { Injectable, Inject } from '@nestjs/common';
import { CategoryRepository } from '../../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../tokens/repository.tokens';

@Injectable()
export class DeleteCategoryUseCase {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: CategoryRepository,
    ) { }

    async execute(id: string): Promise<void> {
        await this.categoryRepository.delete(id);
    }
}
