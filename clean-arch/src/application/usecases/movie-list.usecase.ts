import { MovieRepositoryPort } from '../../domain/repository/movie.repository.port';
import { Movie } from '../../domain/entity/movie.entity';

export class MovieListUseCase {
  constructor(private readonly movieRepo: MovieRepositoryPort) {}

  async execute(): Promise<Movie[]> {
    return this.movieRepo.findAll();
  }
}
