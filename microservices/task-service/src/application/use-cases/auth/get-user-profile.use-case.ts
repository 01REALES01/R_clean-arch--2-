import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
