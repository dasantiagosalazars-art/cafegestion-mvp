import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { UsuarioToken } from '../common/usuario-token';
import { CreateVentaDto } from './dto/create-venta.dto';
import { VentasService } from './ventas.service';

@Controller('ventas')
@UseGuards(JwtAuthGuard)
export class VentasController {
  constructor(@Inject(VentasService) private readonly ventas: VentasService) {}

  @Post()
  registrar(@CurrentUser() user: UsuarioToken, @Body() dto: CreateVentaDto) {
    return this.ventas.registrar(user, dto);
  }

  @Get()
  listar(@CurrentUser() user: UsuarioToken) {
    return this.ventas.listar(user);
  }
}
