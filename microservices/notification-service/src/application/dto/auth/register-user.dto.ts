import { UserRole } from '../../../domain/entities/user.entity';

// Application layer DTO (no validation decorators)
export interface RegisterUserDto {
  email: string;
  password: string;
  role?: UserRole;
}
