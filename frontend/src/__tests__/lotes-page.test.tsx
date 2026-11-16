import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

import LotesPage from "@/app/(main)/dashboard/lotes/page";
import { api } from "@/lib/api";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/api", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/api")>();
  return { ...real, api: vi.fn() };
});

const apiMock = vi.mocked(api);
const lote = { id: "l1", nombre: "El Mirador", areaHa: "2.5", tipoCultivo: "Café", creadoEn: "2026-11-15T00:00:00.000Z" };

function simularApi() {
  apiMock.mockImplementation((async (ruta: string, opciones?: { method?: string }) => {
    if (ruta === "/lotes" && opciones?.method === "POST") return lote;
    if (ruta === "/lotes") return [lote];
    throw new Error(`Ruta no simulada: ${ruta}`);
  }) as unknown as typeof api);
}

describe("Pantalla de lotes (SWR-LOTE-001)", () => {
  it("RTL-07: lista los lotes que devuelve la API", async () => {
    simularApi();
    render(<LotesPage />);

    expect(await screen.findByText("El Mirador")).toBeInTheDocument();
    expect(screen.getByTestId("tabla-lotes")).toBeInTheDocument();
  });

  it("RTL-08: rechaza un área de 0 hectáreas y no envía nada a la API", async () => {
    simularApi();
    const user = userEvent.setup();
    render(<LotesPage />);
    await screen.findByText("El Mirador");

    await user.type(screen.getByLabelText("Nombre del lote"), "Lote Nuevo");
    await user.type(screen.getByLabelText("Área (ha)"), "0");
    await user.click(screen.getByRole("button", { name: "Registrar lote" }));

    expect(await screen.findByText("El área debe ser mayor que 0 hectáreas.")).toBeInTheDocument();
    expect(apiMock).not.toHaveBeenCalledWith("/lotes", expect.objectContaining({ method: "POST" }));
  });

  it("RTL-09: registra un lote válido y deja el formulario vacío (DEF-01)", async () => {
    simularApi();
    const user = userEvent.setup();
    render(<LotesPage />);
    await screen.findByText("El Mirador");

    await user.type(screen.getByLabelText("Nombre del lote"), "La Esperanza");
    await user.type(screen.getByLabelText("Área (ha)"), "3.5");
    await user.click(screen.getByRole("button", { name: "Registrar lote" }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Lote registrado."));
    expect(apiMock).toHaveBeenCalledWith("/lotes", {
      method: "POST",
      body: { nombre: "La Esperanza", areaHa: 3.5, tipoCultivo: "Café" },
    });
    expect(screen.getByLabelText("Nombre del lote")).toHaveValue("");
    expect(screen.getByLabelText("Área (ha)")).toHaveValue(null);
  });
});
