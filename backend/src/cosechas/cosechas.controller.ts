import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { UsuarioToken } from '../common/usuario-token';
import { CosechasService } from './cosechas.service';
import { CreateCosechaDto } from './dto/create-cosecha.dto';

@Controller('cosechas')
@UseGuards(JwtAuthGuard)
export class CosechasController {
  constructor(@Inject(CosechasService) private readonly cosechas: CosechasService) {}

  @Post()
  registrar(@CurrentUser() user: UsuarioToken, @Body() dto: CreateCosechaDto) {
    return this.cosechas.registrar(user, dto);
  }

  @Post(':id/confirmar')
  @HttpCode(200)
  confirmar(@CurrentUser() user: UsuarioToken, @Param('id') id: string) {
    return this.cosechas.confirmar(user, id);
  }

  @Get()
  listar(@CurrentUser() user: UsuarioToken) {
    return this.cosechas.listar(user);
  }
}
