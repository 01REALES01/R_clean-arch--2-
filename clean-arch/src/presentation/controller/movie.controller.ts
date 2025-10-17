import { Controller, Get, Post, Param, Body, Query, Patch, HttpException, HttpStatus, Delete, Put } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { MovieCreateUseCase } from '../../application/usecases/movie-create.usecase';
import { MovieDeleteUseCase } from '../../application/usecases/movie-delete.usecase';
import { MovieGetUseCase } from '../../application/usecases/movie-get.usecase';
import { MovieListUseCase } from '../../application/usecases/movie-list.usecase';
import { toMovieDto } from '../../application/mappers/movie.mapper';

class CreateMovieRequest {
  @ApiProperty({ description: 'Movie id' })
  @IsString()
  @IsUUID()
  id!: string;

  @ApiProperty({ description: 'Movie title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Movie year' })
  @IsString()
  @IsNotEmpty()
  year!: string;
  
  @ApiProperty({ description: 'Director ID' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  directorId!: string;
}

@ApiTags('movie')
@Controller('movie')
export class MovieController {
  constructor(
    private readonly movieCreate: MovieCreateUseCase,
    private readonly movieGet: MovieGetUseCase,
    private readonly movieList: MovieListUseCase,
    private readonly movieDelete: MovieDeleteUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateMovieRequest) {
    try {
      let movie;
      if (body.id) {
       movie = await this.movieCreate.execute({ id: body.id, title: body.title, year: body.year, directorId: body.directorId });        
      }
      else {
        movie = await this.movieCreate.execute({ title: body.title, year: body.year, directorId: body.directorId });
      }

      return toMovieDto(movie);
    } catch (error) {
      if (error.message) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    try {
      const movie = await this.movieGet.execute(id);
      if (!movie) {
        throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
      }
      return toMovieDto(movie);
    } catch (error) {
      if (error.message) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async put(@Param('id') id: string, @Body() body: CreateMovieRequest) {
    try {
      const movie = await this.movieGet.execute(id);
      if (!movie) {
        throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
      }
      return toMovieDto(movie);
    } catch (error) {
      if (error.message) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      const movie = await this.movieGet.execute(id);
      if (!movie) {
        throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
      }
      const deleteMovie = await this.movieDelete.execute(id);
      return deleteMovie
    } catch (error) {
      if (error.message) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async list() {
    try {
      const movies = await this.movieList.execute();
      return movies.map(toMovieDto);
    } catch (error) {
      if (error.message) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
