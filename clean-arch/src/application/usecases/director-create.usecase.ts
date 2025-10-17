import { randomUUID } from 'crypto';
import { Director } from '../../domain/entity/director.entity';
import { DirectorRepositoryPort } from '../../domain/repository/director.repository.port';
import { CreateDirectorDto } from '../dto/director-create.dto';

export class DirectorCreateUseCase {
  constructor(private readonly directorRepo: DirectorRepositoryPort) {}

  async execute(input: CreateDirectorDto): Promise<Director> {
    const nameTaken = await this.directorRepo.existsByName(input.name);
    if (nameTaken) {
      throw new Error('Name already in use');
    }
    const director = new Director(randomUUID(), input.name, input.nationality, input.birth_day );
    return this.directorRepo.save(director);
  }
}
