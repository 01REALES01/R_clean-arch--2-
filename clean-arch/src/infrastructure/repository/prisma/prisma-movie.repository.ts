import { MovieRepositoryPort } from '../../../domain/repository/movie.repository.port';
import { Movie } from '../../../domain/entity/movie.entity';
import { PrismaService } from './prisma.service';
import { Director } from 'src/domain/entity/director.entity';

export class PrismaMovieRepository implements MovieRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(movie: Movie): Promise<Movie> {
    const saved = await this.prisma.movie.upsert({
      where: { id: movie.id },
      update: { title: movie.title, year: movie.year, directorId: movie.directorId },
      create: { id: movie.id, title: movie.title, year: movie.year, directorId: movie.directorId },
    });
    return new Movie(saved.id, saved.title, saved.year, saved.directorId);
  }

  async findById(id: string): Promise<Movie | null> {
    const found = await this.prisma.movie.findUnique({ where: { id }, include: {
      director: true
    } });
    return found ? new Movie(found.id, found.title, found.year, found.directorId) : null;
  }

  async findAll(): Promise<Movie[]> {
    const rows = await this.prisma.movie.findMany();
    return rows.map(r => new Movie(r.id, r.title, r.year, r.directorId));
  }
  
  async delete(id: string): Promise<boolean> {
    const found = await this.prisma.movie.delete({ where: { id } });
    return found ? true : false;
  }
}
