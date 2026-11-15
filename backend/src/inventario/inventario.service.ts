import { Inject, Injectable } from '@nestjs/common';
import { TipoProducto } from '@prisma/client';
import { UsuarioToken } from '../common/usuario-token';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventarioService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** SWR-INV-004: inventario actual de la finca por tipo de producto. */
  async consultar(user: UsuarioToken) {
    const filas = await this.prisma.inventario.findMany({
      where: { fincaId: user.fincaId },
    });

    return Object.values(TipoProducto).map((tipo) => {
      const fila = filas.find((f) => f.tipoProducto === tipo);
      return {
        tipoProducto: tipo,
        cantidadKg: fila ? fila.cantidadKg.toString() : '0',
      };
    });
  }
}
