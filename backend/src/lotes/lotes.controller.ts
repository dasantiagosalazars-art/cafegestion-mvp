import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { UsuarioToken } from '../common/usuario-token';
import { CreateLoteDto } from './dto/create-lote.dto';
import { LotesService } from './lotes.service';

@Controller('lotes')
@UseGuards(JwtAuthGuard)
export class LotesController {
  constructor(@Inject(LotesService) private readonly lotes: LotesService) {}

  @Post()
  crear(@CurrentUser() user: UsuarioToken, @Body() dto: CreateLoteDto) {
    return this.lotes.crear(user, dto);
  }

  @Get()
  listar(@CurrentUser() user: UsuarioToken) {
    return this.lotes.listar(user);
  }
}
