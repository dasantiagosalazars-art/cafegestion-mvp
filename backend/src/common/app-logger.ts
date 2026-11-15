import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export type NivelLog = 'INFO' | 'WARN' | 'ERROR';

/**
 * Log estructurado (una línea JSON por evento) para Shift Right.
 * Campos: timestamp, level, context, event, message, metadata.
 * NUNCA registrar contraseñas, tokens ni secretos en metadata.
 */
export function appLog(
  level: NivelLog,
  context: string,
  event: string,
  message: string,
  metadata: Record<string, unknown> = {},
): void {
  const linea = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    context,
    event,
    message,
    metadata,
  });

  if (level === 'ERROR') {
    console.error(linea);
  } else {
    console.log(linea);
  }

  try {
    const carpeta = join(process.cwd(), 'logs');
    mkdirSync(carpeta, { recursive: true });
    appendFileSync(join(carpeta, 'app.log'), linea + '\n', 'utf8');
  } catch {
    // Si no se puede escribir el archivo, el log en consola es suficiente.
  }
}

/** Oculta parte del correo para los logs: juan@gmail.com -> j***@gmail.com */
export function enmascararCorreo(correo: string): string {
  const [usuario, dominio] = correo.split('@');
  if (!usuario || !dominio) return '***';
  return `${usuario.charAt(0)}***@${dominio}`;
}
