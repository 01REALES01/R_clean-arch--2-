import { Module } from '@nestjs/common';
import { DirectorController } from '../controller/director.controller';
import { DIRECTOR_REPOSITORY } from '../../application/tokens';
import { DirectorCreateUseCase } from '../../application/usecases/director-create.usecase';
import { DirectorDeleteUseCase } from '../../application/usecases/director-delete.usecase';
import { DirectorGetUseCase } from '../../application/usecases/director-get.usecase';
import { DirectorListUseCase } from '../../application/usecases/director-list.usecase';
import { PrismaService } from '../../infrastructure/repository/prisma/prisma.service';
import { PrismaDirectorRepository } from '../../infrastructure/repository/prisma/prisma-director.repository';

@Module({
  controllers: [DirectorController],
  providers: [
    ...([PrismaService]),
    {
      provide: DIRECTOR_REPOSITORY,
      useFactory: (prisma?: PrismaService) => {
        return new PrismaDirectorRepository(prisma!);
      },
      inject: [PrismaService],
    },
    {
      provide: DirectorCreateUseCase,
      useFactory: (repo: any) => new DirectorCreateUseCase(repo),
      inject: [DIRECTOR_REPOSITORY],
    },
    {
      provide: DirectorGetUseCase,
      useFactory: (repo: any) => new DirectorGetUseCase(repo),
      inject: [DIRECTOR_REPOSITORY],
    },
    {
      provide: DirectorListUseCase,
      useFactory: (repo: any) => new DirectorListUseCase(repo),
      inject: [DIRECTOR_REPOSITORY],
    },
    {
      provide: DirectorDeleteUseCase,
      useFactory: (repo: any) => new DirectorDeleteUseCase(repo),
      inject: [DIRECTOR_REPOSITORY],
    },
  ],
})
export class DirectorHttpModule {}
