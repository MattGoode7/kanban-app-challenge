import { Controller, Post, Body, UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.authService.register(createUserDto);
      return this.authService.login(user);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }
      throw error;
    }
  }

  @Post('login')
  async login(@Body() loginDto: { name: string; password: string }) {
    const user = await this.authService.validateUser(loginDto.name, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.authService.login(user);
  }
} 