import { Movie } from "../entity/movie.entity";

export interface MovieRepositoryPort {
  save(user: Movie): Promise<Movie>;
  findById(id: string): Promise<Movie | null>;
  findAll(): Promise<Movie[]>;
  delete(id: string): Promise<boolean>;
}