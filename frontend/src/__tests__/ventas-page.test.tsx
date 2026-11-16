import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

import VentasPage from "@/app/(main)/dashboard/ventas/page";
import { api, ApiError } from "@/lib/api";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/api", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/api")>();
  return { ...real, api: vi.fn() };
});

const apiMock = vi.mocked(api);
const lote = { id: "l1", nombre: "El Mirador", areaHa: "2.5", tipoCultivo: "Café", creadoEn: "2026-11-15T00:00:00.000Z" };

function simularApi(respuestaVenta: () => Promise<unknown>) {
  apiMock.mockImplementation((async (ruta: string, opciones?: { method?: string }) => {
    if (ruta === "/ventas" && opciones?.method === "POST") return respuestaVenta();
    if (ruta === "/ventas") return [];
    if (ruta === "/lotes") return [lote];
    throw new Error(`Ruta no simulada: ${ruta}`);
  }) as unknown as typeof api);
}

async function llenarVenta(user: ReturnType<typeof userEvent.setup>, kg: string) {
  await user.type(screen.getByLabelText("Comprador"), "Café del Sur");
  await user.type(screen.getByLabelText("Cantidad (kg)"), kg);
  await user.type(screen.getByLabelText("Valor total (COP)"), "600000");
}

describe("Pantalla de ventas (SWR-COM-001, SWR-INV-003)", () => {
  it("RTL-12: muestra el motivo del rechazo cuando la venta supera el inventario y conserva lo digitado", async () => {
    const mensaje = "Inventario insuficiente: disponible 70 kg, solicitado 500 kg.";
    simularApi(() => Promise.reject(new ApiError(400, mensaje)));
    const user = userEvent.setup();
    render(<VentasPage />);
    await screen.findByText("Aún no hay ventas registradas.");

    await llenarVenta(user, "500");
    await user.click(screen.getByRole("button", { name: "Registrar venta" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(mensaje));
    expect(screen.getByLabelText("Cantidad (kg)")).toHaveValue(500);
  });

  it("RTL-13: tras una venta correcta envía los lotes de origen y deja todos los campos vacíos (DEF-01)", async () => {
    simularApi(() => Promise.resolve({ id: "v1" }));
    const user = userEvent.setup();
    render(<VentasPage />);
    await screen.findByText("Aún no hay ventas registradas.");

    await llenarVenta(user, "30");
    await user.click(await screen.findByLabelText("El Mirador"));
    await user.click(screen.getByRole("button", { name: "Registrar venta" }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Venta registrada e inventario descontado."));
    expect(apiMock).toHaveBeenCalledWith("/ventas", {
      method: "POST",
      body: { comprador: "Café del Sur", tipoProducto: "PERGAMINO_SECO", cantidadKg: 30, valorTotal: 600000, loteIds: ["l1"] },
    });
    expect(screen.getByLabelText("Comprador")).toHaveValue("");
    expect(screen.getByLabelText("Cantidad (kg)")).toHaveValue(null);
    expect(screen.getByLabelText("Valor total (COP)")).toHaveValue(null);
    expect(screen.getByLabelText("El Mirador")).not.toBeChecked();
  });
});
