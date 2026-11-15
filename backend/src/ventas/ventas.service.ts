import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { appLog } from '../common/app-logger';
import { UsuarioToken } from '../common/usuario-token';
import { evaluarVenta } from '../domain/inventario.rules';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVentaDto } from './dto/create-venta.dto';

@Injectable()
export class VentasService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /**
   * SWR-COM-001 (registrar venta), SWR-INV-002 (descontar inventario),
   * SWR-INV-003 (impedir venta mayor al inventario), SWR-COM-002 (lotes de origen).
   */
  async registrar(user: UsuarioToken, dto: CreateVentaDto) {
    const inicio = Date.now();

    const fila = await this.prisma.inventario.findUnique({
      where: {
        fincaId_tipoProducto: {
          fincaId: user.fincaId,
          tipoProducto: dto.tipoProducto,
        },
      },
    });
    const disponible = fila ? Number(fila.cantidadKg) : 0;

    const evaluacion = evaluarVenta(disponible, dto.cantidadKg);
    if (!evaluacion.permitida) {
      appLog('WARN', 'VentasService', 'SALE_REJECTED', 'Venta rechazada por inventario', {
        tipoProducto: dto.tipoProducto,
        disponibleKg: disponible,
        solicitadoKg: dto.cantidadKg,
      });
      throw new BadRequestException(evaluacion.motivo);
    }

    const loteIds = [...new Set(dto.loteIds ?? [])];
    if (loteIds.length > 0) {
      const existentes = await this.prisma.lote.count({
        where: { id: { in: loteIds }, fincaId: user.fincaId },
      });
      if (existentes !== loteIds.length) {
        throw new BadRequestException(
          'Alguno de los lotes de origen no existe en su finca.',
        );
      }
    }

    const venta = await this.prisma.$transaction(async (tx) => {
      // Descuento condicional y atómico: nunca deja el inventario negativo.
      const descuento = await tx.inventario.updateMany({
        where: {
          fincaId: user.fincaId,
          tipoProducto: dto.tipoProducto,
          cantidadKg: { gte: dto.cantidadKg },
        },
        data: { cantidadKg: { decrement: dto.cantidadKg } },
      });
      if (descuento.count === 0) {
        throw new BadRequestException('Inventario insuficiente para esta venta.');
      }

      return tx.venta.create({
        data: {
          comprador: dto.comprador.trim(),
          tipoProducto: dto.tipoProducto,
          cantidadKg: dto.cantidadKg,
          valorTotal: dto.valorTotal,
          origenNoEspecificado: loteIds.length === 0,
          fincaId: user.fincaId,
          creadaPor: user.sub,
          lotes: { create: loteIds.map((loteId) => ({ loteId })) },
        },
        include: { lotes: true },
      });
    });

    appLog('INFO', 'VentasService', 'SALE_CREATED', 'Venta registrada e inventario descontado', {
      ventaId: venta.id,
      tipoProducto: dto.tipoProducto,
      cantidadKg: dto.cantidadKg,
      durationMs: Date.now() - inicio,
    });

    return venta;
  }

  listar(user: UsuarioToken) {
    return this.prisma.venta.findMany({
      where: { fincaId: user.fincaId },
      orderBy: { creadaEn: 'desc' },
      include: { lotes: true },
    });
  }
}
