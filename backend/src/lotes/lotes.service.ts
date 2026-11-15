import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { appLog } from '../common/app-logger';
import { UsuarioToken } from '../common/usuario-token';
import { normalizarNombreLote, validarLote } from '../domain/lote.rules';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoteDto } from './dto/create-lote.dto';

@Injectable()
export class LotesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** SWR-LOTE-001 y SWR-LOTE-002 */
  async crear(user: UsuarioToken, dto: CreateLoteDto) {
    const validacion = validarLote(dto);
    if (!validacion.valido) {
      appLog('WARN', 'LotesService', 'LOTE_VALIDATION_REJECTED', 'Lote rechazado por validación', {
        errores: validacion.errores,
      });
      throw new BadRequestException(validacion.errores);
    }

    try {
      const lote = await this.prisma.lote.create({
        data: {
          nombre: dto.nombre.trim(),
          nombreNormalizado: normalizarNombreLote(dto.nombre),
          areaHa: dto.areaHa,
          tipoCultivo: dto.tipoCultivo.trim(),
          fincaId: user.fincaId,
        },
      });
      appLog('INFO', 'LotesService', 'LOTE_CREATED', 'Lote creado', {
        loteId: lote.id,
        fincaId: user.fincaId,
      });
      return lote;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        appLog('WARN', 'LotesService', 'LOTE_DUPLICATE', 'Nombre de lote repetido en la finca', {
          fincaId: user.fincaId,
        });
        throw new ConflictException('Ya existe un lote con ese nombre en la finca.');
      }
      throw error;
    }
  }

  listar(user: UsuarioToken) {
    return this.prisma.lote.findMany({
      where: { fincaId: user.fincaId, activo: true },
      orderBy: { creadoEn: 'desc' },
    });
  }
}
