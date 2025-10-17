import { DirectorDto } from "./director.dto";
export interface MovieDto {
  id: string;
  title: string;
  year: string;
  directorId: string;
  director?: DirectorDto;
};
