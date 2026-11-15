import { expect, test } from "@playwright/test";

import { crearLoteYCosechaConfirmadaPorApi, cuentaNueva, iniciarSesionPorUi, registrarPorApi, registrarPorUi } from "./helpers";

test.describe("CafeGestión E2E", () => {
  test("E2E-01 registro: una finca nueva entra al panel con el inventario en cero (SWR-AUTH-001)", async ({ page }) => {
    const cuenta = cuentaNueva();
    await registrarPorUi(page, cuenta);

    await expect(page.getByRole("heading", { name: `Finca ${cuenta.nombreFinca}` })).toBeVisible();
    const resumen = page.getByTestId("resumen-inventario");
    await expect(resumen).toContainText("Cereza");
    await expect(resumen.getByText("0 kg")).toHaveCount(3);
  });

  test("E2E-02 seguridad: sin sesión, una ruta privada redirige al login (SWR-SEC-001)", async ({ page }) => {
    await page.goto("/dashboard/ventas");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
  });

  test("E2E-03 login con contraseña incorrecta muestra el error y no entra (SWR-AUTH-003)", async ({ page, request }) => {
    const cuenta = cuentaNueva();
    await registrarPorApi(request, cuenta);

    await page.goto("/login");
    await page.getByLabel("Correo electrónico").fill(cuenta.email);
    await page.getByLabel("Contraseña").fill("contrasena-equivocada");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await expect(page.getByText("Correo o contraseña incorrectos.")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("E2E-04 FLUJO PRINCIPAL: lote, cosecha confirmada, inventario y venta (SWR-LOTE-001, COS-001, COS-002, INV-001, COM-001, INV-002)", async ({ page }) => {
    const cuenta = cuentaNueva();
    await registrarPorUi(page, cuenta);

    // 1. Registrar un lote
    await page.goto("/dashboard/lotes");
    await page.getByLabel("Nombre del lote").fill("El Mirador");
    await page.getByLabel("Área (ha)").fill("2.5");
    await page.getByRole("button", { name: "Registrar lote" }).click();
    await expect(page.getByText("Lote registrado.")).toBeVisible();
    await expect(page.getByTestId("tabla-lotes")).toContainText("El Mirador");

    // 2. Registrar y confirmar una cosecha de 100 kg
    await page.goto("/dashboard/cosechas");
    await page.getByLabel("Lote", { exact: true }).selectOption({ label: "El Mirador" });
    await page.getByLabel("Cantidad (kg)").fill("100");
    await page.getByLabel("Producto").selectOption("PERGAMINO_SECO");
    await page.getByRole("button", { name: "Registrar cosecha" }).click();
    await expect(page.getByText("Registrada", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Confirmar" }).click();
    await expect(page.getByText("Cosecha confirmada. El inventario fue actualizado.")).toBeVisible();
    await expect(page.getByText("Confirmada", { exact: true })).toBeVisible();

    // 3. El inventario refleja 100 kg
    await page.goto("/dashboard/inventario");
    await expect(page.getByTestId("inventario-PERGAMINO_SECO")).toContainText("100 kg");

    // 4. Vender 30 kg y comprobar el descuento
    await page.goto("/dashboard/ventas");
    await page.getByLabel("Comprador").fill("Café del Sur");
    await page.getByLabel("Cantidad (kg)").fill("30");
    await page.getByLabel("Valor total (COP)").fill("600000");
    await page.getByRole("button", { name: "Registrar venta" }).click();
    await expect(page.getByText("Venta registrada e inventario descontado.")).toBeVisible();
    await expect(page.getByTestId("tabla-ventas")).toContainText("Café del Sur");

    await page.goto("/dashboard/inventario");
    await expect(page.getByTestId("inventario-PERGAMINO_SECO")).toContainText("70 kg");
  });

  test("E2E-05 FLUJO PRINCIPAL (negativo): una venta mayor al inventario se rechaza y el inventario no cambia (SWR-INV-003)", async ({ page, request }) => {
    const cuenta = cuentaNueva();
    const token = await registrarPorApi(request, cuenta);
    await crearLoteYCosechaConfirmadaPorApi(request, token, 100);
    await iniciarSesionPorUi(page, cuenta);

    await page.goto("/dashboard/ventas");
    await page.getByLabel("Comprador").fill("Café del Sur");
    await page.getByLabel("Cantidad (kg)").fill("500");
    await page.getByLabel("Valor total (COP)").fill("600000");
    await page.getByRole("button", { name: "Registrar venta" }).click();

    await expect(page.getByText("Inventario insuficiente: disponible 100 kg, solicitado 500 kg.")).toBeVisible();
    await expect(page.getByText("Aún no hay ventas registradas.")).toBeVisible();

    await page.goto("/dashboard/inventario");
    await expect(page.getByTestId("inventario-PERGAMINO_SECO")).toContainText("100 kg");
  });
});
