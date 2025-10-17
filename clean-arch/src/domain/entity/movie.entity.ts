import { Director } from './director.entity';

export class Movie {
  constructor(
    public readonly id: string,
    public title: string,
    public year: string,
    public directorId: Director['id'],
    public director?: Director,
  ) {}
}