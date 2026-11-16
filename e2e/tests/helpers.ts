import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const API_URL = process.env.E2E_API_URL ?? "http://localhost:4000";

export interface Cuenta {
  email: string;
  password: string;
  nombreFinca: string;
}

/** Datos únicos por corrida para no chocar con cuentas anteriores. */
export function cuentaNueva(): Cuenta {
  const sufijo = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return { email: `e2e_${sufijo}@prueba.com`, password: `Clave${sufijo}x`, nombreFinca: `Finca E2E ${sufijo}` };
}

/** Prepara datos por API (rápido) y devuelve el token para llamadas siguientes. */
export async function registrarPorApi(request: APIRequestContext, cuenta: Cuenta): Promise<string> {
  const respuesta = await request.post(`${API_URL}/auth/register`, {
    data: { nombre: "Usuario E2E", nombreFinca: cuenta.nombreFinca, email: cuenta.email, password: cuenta.password },
  });
  expect(respuesta.status()).toBe(201);
  return (await respuesta.json()).accessToken as string;
}

export async function iniciarSesionPorUi(page: Page, cuenta: Cuenta): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(cuenta.email);
  await page.getByLabel("Contraseña").fill(cuenta.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

export async function registrarPorUi(page: Page, cuenta: Cuenta): Promise<void> {
  await page.goto("/register");
  await page.getByLabel("Su nombre").fill("Usuario E2E");
  await page.getByLabel("Nombre de la finca").fill(cuenta.nombreFinca);
  await page.getByLabel("Correo electrónico").fill(cuenta.email);
  await page.getByLabel("Contraseña (mínimo 8 caracteres)").fill(cuenta.password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

export async function crearLoteYCosechaConfirmadaPorApi(request: APIRequestContext, token: string, kg: number): Promise<void> {
  const cabeceras = { Authorization: `Bearer ${token}` };
  const lote = await request.post(`${API_URL}/lotes`, { headers: cabeceras, data: { nombre: "El Mirador", areaHa: 2.5, tipoCultivo: "Café" } });
  expect(lote.status()).toBe(201);
  const { id: loteId } = await lote.json();
  const cosecha = await request.post(`${API_URL}/cosechas`, {
    headers: cabeceras,
    data: { loteId, fecha: new Date().toISOString().slice(0, 10), cantidadKg: kg, tipoProducto: "PERGAMINO_SECO" },
  });
  expect(cosecha.status()).toBe(201);
  const { id: cosechaId } = await cosecha.json();
  const confirmada = await request.post(`${API_URL}/cosechas/${cosechaId}/confirmar`, { headers: cabeceras });
  expect(confirmada.status()).toBe(200);
}
