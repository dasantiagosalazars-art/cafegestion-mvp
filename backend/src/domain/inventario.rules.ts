export type ResultadoVenta =
  | { permitida: true }
  | { permitida: false; motivo: string };

/**
 * SWR-INV-003: no se puede vender una cantidad superior al inventario
 * disponible del tipo de producto. Una cantidad igual al disponible SÍ se acepta.
 */
export function evaluarVenta(
  disponibleKg: number,
  cantidadKg: number,
): ResultadoVenta {
  if (!(cantidadKg > 0)) {
    return {
      permitida: false,
      motivo: 'La cantidad a vender debe ser mayor que 0 kg.',
    };
  }

  if (cantidadKg > disponibleKg) {
    return {
      permitida: false,
      motivo: `Inventario insuficiente: disponible ${disponibleKg} kg, solicitado ${cantidadKg} kg.`,
    };
  }

  return { permitida: true };
}

/** Redondea a 2 decimales para evitar errores de coma flotante en kg. */
export function redondearKg(valor: number): number {
  return Math.round(valor * 100) / 100;
}
