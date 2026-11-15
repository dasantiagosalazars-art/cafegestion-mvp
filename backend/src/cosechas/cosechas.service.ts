import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { appLog } from '../common/app-logger';
import { UsuarioToken } from '../common/usuario-token';
import { puedeConfirmarCosecha, validarCosecha } from '../domain/cosecha.rules';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCosechaDto } from './dto/create-cosecha.dto';

@Injectable()
export class CosechasService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** SWR-COS-001: registra la cosecha (estado REGISTRADA, aún no suma al inventario). */
  async registrar(user: UsuarioToken, dto: CreateCosechaDto) {
    const validacion = validarCosecha({
      cantidadKg: dto.cantidadKg,
      fecha: new Date(dto.fecha),
    });
    if (!validacion.valido) {
      appLog('WARN', 'CosechasService', 'HARVEST_VALIDATION_REJECTED', 'Cosecha rechazada por validación', {
        errores: validacion.errores,
      });
      throw new BadRequestException(validacion.errores);
    }

    const lote = await this.prisma.lote.findFirst({
      where: { id: dto.loteId, fincaId: user.fincaId, activo: true },
    });
    if (!lote) {
      throw new NotFoundException('El lote no existe en su finca.');
    }

    const cosecha = await this.prisma.cosecha.create({
      data: {
        fecha: new Date(dto.fecha),
        cantidadKg: dto.cantidadKg,
        tipoProducto: dto.tipoProducto,
        loteId: lote.id,
        fincaId: user.fincaId,
      },
    });
    appLog('INFO', 'CosechasService', 'HARVEST_REGISTERED', 'Cosecha registrada', {
      cosechaId: cosecha.id,
      loteId: lote.id,
    });
    return cosecha;
  }

  /** SWR-INV-001: al confirmar, incrementa el inventario una sola vez. */
  async confirmar(user: UsuarioToken, id: string) {
    const inicio = Date.now();

    const cosecha = await this.prisma.cosecha.findFirst({
      where: { id, fincaId: user.fincaId },
    });
    if (!cosecha) {
      throw new NotFoundException('Cosecha no encontrada.');
    }
    if (!puedeConfirmarCosecha(cosecha.estado)) {
      appLog('WARN', 'CosechasService', 'HARVEST_ALREADY_CONFIRMED', 'Intento de confirmar una cosecha ya confirmada', {
        cosechaId: id,
      });
      throw new ConflictException('La cosecha ya fue confirmada.');
    }

    const inventario = await this.prisma.$transaction(async (tx) => {
      // Actualización condicional: si dos solicitudes llegan a la vez, solo una gana.
      const cambio = await tx.cosecha.updateMany({
        where: { id, fincaId: user.fincaId, estado: 'REGISTRADA' },
        data: { estado: 'CONFIRMADA', confirmadaEn: new Date() },
      });
      if (cambio.count === 0) {
        throw new ConflictException('La cosecha ya fue confirmada.');
      }

      return tx.inventario.upsert({
        where: {
          fincaId_tipoProducto: {
            fincaId: user.fincaId,
            tipoProducto: cosecha.tipoProducto,
          },
        },
        update: { cantidadKg: { increment: cosecha.cantidadKg } },
        create: {
          fincaId: user.fincaId,
          tipoProducto: cosecha.tipoProducto,
          cantidadKg: cosecha.cantidadKg,
        },
      });
    });

    appLog('INFO', 'CosechasService', 'HARVEST_CONFIRMED', 'Cosecha confirmada e inventario actualizado', {
      cosechaId: id,
      tipoProducto: cosecha.tipoProducto,
      durationMs: Date.now() - inicio,
    });

    return {
      cosechaId: id,
      estado: 'CONFIRMADA',
      inventario: {
        tipoProducto: inventario.tipoProducto,
        cantidadKg: inventario.cantidadKg.toString(),
      },
    };
  }

  listar(user: UsuarioToken) {
    return this.prisma.cosecha.findMany({
      where: { fincaId: user.fincaId },
      orderBy: { creadaEn: 'desc' },
      include: { lote: { select: { nombre: true } } },
    });
  }
}
