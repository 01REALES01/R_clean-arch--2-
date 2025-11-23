import { Category } from '../entities/category.entity';

export interface CategoryRepository {
    create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category>;
    findById(id: string): Promise<Category | null>;
    findByUserId(userId: string): Promise<Category[]>;
    update(category: Category): Promise<Category>;
    delete(id: string): Promise<void>;
}
