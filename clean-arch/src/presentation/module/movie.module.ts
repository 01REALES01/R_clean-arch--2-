import { Module } from '@nestjs/common';
import { MovieController } from '../controller/movie.controller';
import { MOVIE_REPOSITORY, DIRECTOR_REPOSITORY } from '../../application/tokens';
import { MovieCreateUseCase } from '../../application/usecases/movie-create.usecase';
import { MovieGetUseCase } from '../../application/usecases/movie-get.usecase';
import { MovieListUseCase } from '../../application/usecases/movie-list.usecase';
import { MovieDeleteUseCase } from '../../application/usecases/movie-delete.usecase';
import { PrismaService } from '../../infrastructure/repository/prisma/prisma.service';
import { PrismaMovieRepository } from '../../infrastructure/repository/prisma/prisma-movie.repository';
import { PrismaDirectorRepository } from '../../infrastructure/repository/prisma/prisma-director.repository';

@Module({
  controllers: [MovieController],
  providers: [
    ...([PrismaService]),
    {
      provide: MOVIE_REPOSITORY,
      useFactory: (prisma?: PrismaService) => {
        return new PrismaMovieRepository(prisma!);
      },
      inject: [PrismaService],
    },
    {
      provide: DIRECTOR_REPOSITORY,
      useFactory: (prisma?: PrismaService) => {
        return new PrismaDirectorRepository(prisma!);
      },
      inject: [PrismaService],
    },
    {
      provide: MovieCreateUseCase,
      useFactory: (taskRepo: any, categoryRepo: any) => new MovieCreateUseCase(taskRepo, categoryRepo),
      inject: [MOVIE_REPOSITORY, DIRECTOR_REPOSITORY],
    },
    {
      provide: MovieGetUseCase,
      useFactory: (repo: any) => new MovieGetUseCase(repo),
      inject: [MOVIE_REPOSITORY],
    },
    {
      provide: MovieListUseCase,
      useFactory: (repo: any) => new MovieListUseCase(repo),
      inject: [MOVIE_REPOSITORY],
    },
    {
      provide: MovieDeleteUseCase,
      useFactory: (repo: any) => new MovieDeleteUseCase(repo),
      inject: [MOVIE_REPOSITORY],
    },
  ],
})
export class MovieHttpModule {}
