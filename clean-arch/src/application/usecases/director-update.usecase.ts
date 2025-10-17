import { Director } from '../../domain/entity/director.entity';
import { DirectorRepositoryPort } from '../../domain/repository/director.repository.port';
import { CreateDirectorDto } from '../dto/director-create.dto';

export class DirectorCreateUseCase {
  constructor(private readonly directorRepo: DirectorRepositoryPort) {}

  async execute(id: string, input: CreateDirectorDto): Promise<Director> {
    const nameTaken = await this.directorRepo.existsByName(input.name);
    if (nameTaken) {
      throw new Error('Name already in use');
    }
    const director = new Director(id, input.name, input.nationality, input.birth_day );        
    return this.directorRepo.save(director);
  }
}
