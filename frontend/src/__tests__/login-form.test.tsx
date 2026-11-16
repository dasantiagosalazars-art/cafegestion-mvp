import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/login-form";
import { api, ApiError, setToken } from "@/lib/api";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, push: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/api", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/api")>();
  return { ...real, api: vi.fn(), setToken: vi.fn() };
});

const apiMock = vi.mocked(api);

describe("LoginForm (SWR-AUTH-001, SWR-AUTH-002)", () => {
  it("RTL-01: muestra los campos, el botón y el enlace de registro", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Regístrese" })).toHaveAttribute("href", "/register");
  });

  it("RTL-02: no llama a la API y muestra errores si el formulario está vacío", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByText("El correo electrónico no es válido.")).toBeInTheDocument();
    expect(screen.getByText("La contraseña es obligatoria.")).toBeInTheDocument();
    expect(apiMock).not.toHaveBeenCalled();
  });

  it("RTL-03: con datos válidos llama a /auth/login, guarda el token y redirige al panel", async () => {
    apiMock.mockResolvedValueOnce({ accessToken: "token-de-prueba" });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Correo electrónico"), "ana@finca.com");
    await user.type(screen.getByLabelText("Contraseña"), "Clave12345");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
    expect(apiMock).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: { email: "ana@finca.com", password: "Clave12345" },
    });
    expect(setToken).toHaveBeenCalledWith("token-de-prueba");
  });

  it("RTL-04: si la API rechaza las credenciales muestra el mensaje y no redirige", async () => {
    apiMock.mockRejectedValueOnce(new ApiError(401, "Correo o contraseña incorrectos."));
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Correo electrónico"), "ana@finca.com");
    await user.type(screen.getByLabelText("Contraseña"), "incorrecta");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Correo o contraseña incorrectos."));
    expect(replace).not.toHaveBeenCalled();
    expect(setToken).not.toHaveBeenCalled();
  });
});
