import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

import CosechasPage from "@/app/(main)/dashboard/cosechas/page";
import { api } from "@/lib/api";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/api", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/api")>();
  return { ...real, api: vi.fn() };
});

const apiMock = vi.mocked(api);
const base = { fecha: "2026-11-15T00:00:00.000Z", tipoProducto: "PERGAMINO_SECO", loteId: "l1", lote: { nombre: "El Mirador" } };
const cosechas = [
  { ...base, id: "c1", cantidadKg: "100", estado: "REGISTRADA" },
  { ...base, id: "c2", cantidadKg: "50", estado: "CONFIRMADA" },
];

function simularApi() {
  apiMock.mockImplementation((async (ruta: string, opciones?: { method?: string }) => {
    if (ruta === "/cosechas/c1/confirmar" && opciones?.method === "POST") return { ...cosechas[0], estado: "CONFIRMADA" };
    if (ruta === "/cosechas") return cosechas;
    if (ruta === "/lotes") return [{ id: "l1", nombre: "El Mirador", areaHa: "2.5", tipoCultivo: "Café", creadoEn: base.fecha }];
    throw new Error(`Ruta no simulada: ${ruta}`);
  }) as unknown as typeof api);
}

describe("Pantalla de cosechas (SWR-COS-001, SWR-INV-001)", () => {
  it("RTL-10: el botón Confirmar aparece solo en las cosechas REGISTRADAS", async () => {
    simularApi();
    render(<CosechasPage />);

    expect(await screen.findByText("Registrada")).toBeInTheDocument();
    expect(screen.getByText("Confirmada")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Confirmar" })).toHaveLength(1);
  });

  it("RTL-11: al confirmar llama a la API con el id de la cosecha y avisa al usuario", async () => {
    simularApi();
    const user = userEvent.setup();
    render(<CosechasPage />);

    await user.click(await screen.findByRole("button", { name: "Confirmar" }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Cosecha confirmada. El inventario fue actualizado."),
    );
    expect(apiMock).toHaveBeenCalledWith("/cosechas/c1/confirmar", { method: "POST" });
  });
});
