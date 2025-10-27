import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../../../auth/auth.service';
import { RegisterDto } from '../../dto/register.dto';
import { LoginDto } from '../../dto/login.dto';
import { UserRole } from '../../../domain/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user (default role: USER)' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or user already exists' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register({
      email: registerDto.email,
      password: registerDto.password,
    });

    return {
      message: 'User registered successfully',
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
      },
    };
  }

  @Post('register-admin')
  @ApiOperation({ 
    summary: 'Register an ADMIN user (for demo/testing only)',
    description: 'In production, this endpoint should be secured or removed. Use it to create admin accounts for testing.'
  })
  @ApiResponse({ status: 201, description: 'Admin user registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or user already exists' })
  async registerAdmin(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register({
      email: registerDto.email,
      password: registerDto.password,
      role: UserRole.ADMIN, // Force ADMIN role
    });

    return {
      message: 'Admin user registered successfully',
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
      },
      warning: 'This endpoint should be removed in production!',
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    const result = await this.authService.login(user);

    return {
      message: 'Login successful',
      access_token: result.access_token,
      user: result.user,
    };
  }
}
