import { ResultadoValidacion } from './tipos';

/**
 * SWR-LOTE-002: el nombre del lote es único dentro de la finca sin distinguir
 * mayúsculas/minúsculas ni espacios al inicio o final.
 */
export function normalizarNombreLote(nombre: string): string {
  return nombre.trim().toLowerCase();
}

export interface DatosLote {
  nombre: string;
  areaHa: number;
  tipoCultivo: string;
}

/**
 * SWR-LOTE-001: un lote requiere nombre (1 a 100 caracteres), área en
 * hectáreas mayor que 0 y tipo de cultivo.
 */
export function validarLote(datos: DatosLote): ResultadoValidacion {
  const errores: string[] = [];

  const nombre = (datos.nombre ?? '').trim();
  if (nombre.length < 1 || nombre.length > 100) {
    errores.push('El nombre del lote debe tener entre 1 y 100 caracteres.');
  }

  if (!(datos.areaHa > 0)) {
    errores.push('El área del lote debe ser mayor que 0 hectáreas.');
  }

  if (!datos.tipoCultivo || datos.tipoCultivo.trim().length === 0) {
    errores.push('El tipo de cultivo es obligatorio.');
  }

  return { valido: errores.length === 0, errores };
}
