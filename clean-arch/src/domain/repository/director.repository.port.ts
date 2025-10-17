import { Director } from "../entity/director.entity";

export interface DirectorRepositoryPort {
  save(user: Director): Promise<Director>;
  findById(id: string): Promise<Director | null>;
  findAll(): Promise<Director[]>;
  delete(id: string): Promise<boolean>;
  existsByName(name: string): Promise<boolean>;
}
