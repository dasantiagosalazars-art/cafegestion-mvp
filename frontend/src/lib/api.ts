/**
 * Cliente HTTP del frontend. El navegador NUNCA habla con la base de datos:
 * todas las operaciones pasan por la API (NEXT_PUBLIC_API_URL).
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const TOKEN_KEY = "cafegestion_token";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // sin almacenamiento: la sesión dura solo mientras la pestaña esté abierta
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // nada que limpiar
  }
}

/** Convierte la respuesta de error de la API (NestJS) en un texto legible. */
export function mensajeDeError(cuerpo: unknown, estado: number): string {
  if (cuerpo && typeof cuerpo === "object" && "message" in cuerpo) {
    const mensaje = (cuerpo as { message: unknown }).message;
    if (Array.isArray(mensaje)) return mensaje.join(" ");
    if (typeof mensaje === "string") return mensaje;
  }
  return `Error inesperado (${estado}).`;
}

interface Opciones {
  method?: "GET" | "POST";
  body?: unknown;
}

export async function api<T>(ruta: string, { method = "GET", body }: Opciones = {}): Promise<T> {
  const token = getToken();
  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor. Intente de nuevo.");
  }

  const texto = await respuesta.text();
  let cuerpo: unknown = null;
  try {
    cuerpo = texto ? JSON.parse(texto) : null;
  } catch {
    cuerpo = null;
  }

  if (!respuesta.ok) {
    throw new ApiError(respuesta.status, mensajeDeError(cuerpo, respuesta.status));
  }
  return cuerpo as T;
}

export function formatearKg(valor: string | number): string {
  return `${Number(valor).toLocaleString("es-CO", { maximumFractionDigits: 2 })} kg`;
}

export function formatearCOP(valor: string | number): string {
  return Number(valor).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

export function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", { timeZone: "UTC" });
}
