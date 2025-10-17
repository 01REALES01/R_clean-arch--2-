import { MovieRepositoryPort } from '../../domain/repository/movie.repository.port';
import { Movie } from '../../domain/entity/movie.entity';

export class MovieGetUseCase {
  constructor(private readonly movieRepo: MovieRepositoryPort) {}

  async execute(id: string): Promise<Movie | null> {
    return this.movieRepo.findById(id);
  }
}
