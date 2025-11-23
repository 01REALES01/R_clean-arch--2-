import { Controller, Post, Get, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { CreateCategoryUseCase } from '../../../application/use-cases/category/create-category.use-case';
import { GetUserCategoriesUseCase } from '../../../application/use-cases/category/get-user-categories.use-case';
import { DeleteCategoryUseCase } from '../../../application/use-cases/category/delete-category.use-case';
import { CreateCategoryDto } from '../../dtos/category/create-category.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
    constructor(
        private readonly createCategoryUseCase: CreateCategoryUseCase,
        private readonly getUserCategoriesUseCase: GetUserCategoriesUseCase,
        private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new category' })
    @ApiResponse({ status: 201, description: 'Category created successfully' })
    async create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
        return this.createCategoryUseCase.execute({
            ...createCategoryDto,
            userId: req.user.id,
        });
    }

    @Get()
    @ApiOperation({ summary: 'Get all categories for the current user' })
    @ApiResponse({ status: 200, description: 'Return all categories' })
    async findAll(@Request() req) {
        return this.getUserCategoriesUseCase.execute(req.user.id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a category' })
    @ApiResponse({ status: 200, description: 'Category deleted successfully' })
    async remove(@Param('id') id: string) {
        return this.deleteCategoryUseCase.execute(id);
    }
}
