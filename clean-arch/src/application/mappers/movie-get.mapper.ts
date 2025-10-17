import { Movie } from '../../domain/entity/movie.entity';
import { MovieDto } from '../dto/movie.dto';

export const toMovieDto = (d: Movie): MovieDto => ({
  id: d.id,
  title: d.title,
  year: d.year,
  directorId: d.directorId,
  director: d.director,
});
