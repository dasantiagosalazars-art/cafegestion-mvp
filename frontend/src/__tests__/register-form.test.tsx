import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

import { RegisterForm } from "@/components/auth/register-form";
import { api, setToken } from "@/lib/api";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, push: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/api", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/api")>();
  return { ...real, api: vi.fn(), setToken: vi.fn() };
});

const apiMock = vi.mocked(api);

async function llenar(user: ReturnType<typeof userEvent.setup>, password: string) {
  await user.type(screen.getByLabelText("Su nombre"), "Ana Pérez");
  await user.type(screen.getByLabelText("Nombre de la finca"), "La Esperanza");
  await user.type(screen.getByLabelText("Correo electrónico"), "ana@finca.com");
  await user.type(screen.getByLabelText("Contraseña (mínimo 8 caracteres)"), password);
}

describe("RegisterForm (SWR-AUTH-001, SWR-SEC-002)", () => {
  it("RTL-05: rechaza una contraseña de menos de 8 caracteres sin llamar a la API", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await llenar(user, "corta");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByText("La contraseña debe tener al menos 8 caracteres.")).toBeInTheDocument();
    expect(apiMock).not.toHaveBeenCalled();
  });

  it("RTL-06: con datos válidos registra la finca, guarda el token y entra al panel", async () => {
    apiMock.mockResolvedValueOnce({ accessToken: "token-nuevo" });
    const user = userEvent.setup();
    render(<RegisterForm />);

    await llenar(user, "ClaveSegura1");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
    expect(apiMock).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: { nombre: "Ana Pérez", nombreFinca: "La Esperanza", email: "ana@finca.com", password: "ClaveSegura1" },
    });
    expect(setToken).toHaveBeenCalledWith("token-nuevo");
    expect(toast.success).toHaveBeenCalledWith("Cuenta creada. ¡Bienvenido!");
  });
});
