import { Director } from '../../domain/entity/director.entity';
import { DirectorDto } from '../dto/director.dto';

export const toDirectorDto = (d: Director): DirectorDto => ({
  id: d.id,
  name: d.name,
  nationality: d.nationality,
  birth_day: d.birth_day,
});
