import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../../../application/auth/auth.service';
import { LoginDto } from '../../../application/auth/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }
}
