import { randomUUID } from 'crypto';
import { Movie } from '../../domain/entity/movie.entity';
import { MovieRepositoryPort } from '../../domain/repository/movie.repository.port';
import { CreateMovieDto } from '../dto/movie-create.dto';
import { DirectorRepositoryPort } from '../../domain/repository/director.repository.port';

export class MovieCreateUseCase {
  constructor(
    private readonly movieRepo: MovieRepositoryPort,
    private readonly directorRepo: DirectorRepositoryPort,
  ) {}

  async execute(input: CreateMovieDto): Promise<Movie> {
    const directorIdExists = await this.directorRepo.findById(input.directorId);
    if (!directorIdExists) {
      throw new Error('directorId does not exist');
    }
    const movie = new Movie(randomUUID(), input.title, input.year, input.directorId);
    return this.movieRepo.save(movie);
  }
}
