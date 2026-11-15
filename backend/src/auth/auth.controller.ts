import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { UsuarioToken } from '../common/usuario-token';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post('register')
  registrar(@Body() dto: RegisterDto) {
    return this.auth.registrar(dto);
  }

  @Post('login')
  @HttpCode(200)
  iniciarSesion(@Body() dto: LoginDto) {
    return this.auth.iniciarSesion(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  perfil(@CurrentUser() user: UsuarioToken) {
    return this.auth.perfil(user.sub);
  }
}
