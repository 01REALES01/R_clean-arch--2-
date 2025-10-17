import { MovieRepositoryPort } from '../../domain/repository/movie.repository.port';

export class MovieDeleteUseCase {
  constructor(private readonly movieRepo: MovieRepositoryPort) {}

  async execute(id: string): Promise<boolean> {
    return this.movieRepo.delete(id);
  }
}
