import { Injectable, UnauthorizedException, Inject, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '../domain/entities/user.entity';
import { UserRepository } from '../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../application/tokens/repository.tokens';
import * as bcrypt from 'bcrypt';

type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1h', // Token expires in 1 hour
      }),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(registerDto: { email: string; password: string; role?: UserRole }) {
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user data without id, createdAt, updatedAt (let Prisma generate them)
    const userData = {
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role || UserRole.USER, // Default to USER, but allow override
    };

    const savedUser = await this.userRepository.create(userData);

    const { password, ...result } = savedUser;
    return result;
  }
}
