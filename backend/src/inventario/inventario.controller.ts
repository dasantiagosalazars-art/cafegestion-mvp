import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { UsuarioToken } from '../common/usuario-token';
import { InventarioService } from './inventario.service';

@Controller('inventario')
@UseGuards(JwtAuthGuard)
export class InventarioController {
  constructor(@Inject(InventarioService) private readonly inventario: InventarioService) {}

  @Get()
  consultar(@CurrentUser() user: UsuarioToken) {
    return this.inventario.consultar(user);
  }
}
