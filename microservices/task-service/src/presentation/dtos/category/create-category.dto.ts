import { IsString, IsNotEmpty, IsHexColor } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Work', description: 'The name of the category' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: '#FF5733', description: 'The color of the category (hex)' })
    @IsString()
    @IsNotEmpty()
    // @IsHexColor() // Optional: strict validation
    color: string;

    @ApiProperty({ example: '💼', description: 'The icon of the category' })
    @IsString()
    @IsNotEmpty()
    icon: string;
}
