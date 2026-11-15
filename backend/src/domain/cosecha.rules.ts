import { ResultadoValidacion } from './tipos';

export interface DatosCosecha {
  cantidadKg: number;
  fecha: Date;
}

/**
 * SWR-COS-001: la cosecha requiere cantidad en kg mayor que 0 y una fecha
 * válida que no sea futura.
 */
export function validarCosecha(
  datos: DatosCosecha,
  hoy: Date = new Date(),
): ResultadoValidacion {
  const errores: string[] = [];

  if (!(datos.cantidadKg > 0)) {
    errores.push('La cantidad cosechada debe ser mayor que 0 kg.');
  }

  if (Number.isNaN(datos.fecha.getTime())) {
    errores.push('La fecha de cosecha no es válida.');
  } else if (datos.fecha.getTime() > hoy.getTime()) {
    errores.push('La fecha de cosecha no puede ser futura.');
  }

  return { valido: errores.length === 0, errores };
}

/**
 * SWR-INV-001: solo una cosecha en estado REGISTRADA puede confirmarse.
 * Evita incrementar el inventario dos veces con la misma cosecha.
 */
export function puedeConfirmarCosecha(estado: string): boolean {
  return estado === 'REGISTRADA';
}
