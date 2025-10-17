import { DirectorRepositoryPort } from '../../domain/repository/director.repository.port';
import { Director } from '../../domain/entity/director.entity';

export class DirectorGetUseCase {
  constructor(private readonly directorRepo: DirectorRepositoryPort) {}

  async execute(id: string): Promise<Director | null> {
    return this.directorRepo.findById(id);
  }
}
