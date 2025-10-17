import { DirectorRepositoryPort } from '../../domain/repository/director.repository.port';

export class DirectorDeleteUseCase {
  constructor(private readonly directorRepo: DirectorRepositoryPort) {}

  async execute(id: string): Promise<boolean> {
    return this.directorRepo.delete(id);
  }
}
