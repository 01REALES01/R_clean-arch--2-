import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User, UserRole } from '../../../domain/entities/user.entity';
import { RegisterUserDto } from '../../dto/auth/register-user.dto';
import { USER_REPOSITORY } from '../../tokens/repository.tokens';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(dto: RegisterUserDto & { role?: 'USER' | 'ADMIN' }): Promise<Omit<User, 'password'>> {
    // Hash the password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Determine role - default to USER, but allow override for admin registration
    const role = dto.role === 'ADMIN' ? UserRole.ADMIN : UserRole.USER;

    // Create user data without id, createdAt, updatedAt (let Prisma generate them)
    const userData = {
      email: dto.email,
      password: hashedPassword,
      role,
    };

    const createdUser = await this.userRepository.create(userData);

    // Return user without password
    const { password, ...userWithoutPassword } = createdUser;
    return userWithoutPassword;
  }
}
