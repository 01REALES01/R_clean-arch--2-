import { DirectorRepositoryPort } from '../../domain/repository/director.repository.port';
import { Director } from '../../domain/entity/director.entity';

export class DirectorListUseCase {
  constructor(private readonly directorRepo: DirectorRepositoryPort) {}

  async execute(): Promise<Director[]> {
    return this.directorRepo.findAll();
  }
}
