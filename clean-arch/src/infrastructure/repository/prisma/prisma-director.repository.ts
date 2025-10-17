import { DirectorRepositoryPort } from '../../../domain/repository/director.repository.port';
import { Director } from '../../../domain/entity/director.entity';
import { PrismaService } from './prisma.service';

export class PrismaDirectorRepository implements DirectorRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(director: Director): Promise<Director> {
    const saved = await this.prisma.director.upsert({
      where: { id: director.id },
      update: { name: director.name, nationality: director.nationality, birth_day: director.birth_day },
      create: { id: director.id, name: director.name, nationality: director.nationality, birth_day: director.birth_day },
    });
    return new Director(saved.id, saved.name, saved.nationality, saved.birth_day);
  }

  async findById(id: string): Promise<Director | null> {
    const found = await this.prisma.director.findUnique({ where: { id } });
    return found ? new Director(found.id, found.name, found.nationality, found.birth_day) : null;
  }

  async findAll(): Promise<Director[]> {
    const rows = await this.prisma.director.findMany();
    return rows.map(r => new Director(r.id, r.name, r.nationality, r.birth_day));
  }

  async delete(id: string): Promise<boolean> {
    const found = await this.prisma.director.delete({ where: { id } });

    return found ? true : false;
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.director.count({ where: { 
      name: {
        equals: name, mode: 'insensitive'
      }
     } });
    return count > 0;
  }
}
