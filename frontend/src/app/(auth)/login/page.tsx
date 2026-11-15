import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Iniciar sesión · CafeGestión" };

export default function LoginPage() {
  return (
    <AuthShell titulo="Iniciar sesión" descripcion="Ingrese con su correo y contraseña para administrar su finca.">
      <LoginForm />
    </AuthShell>
  );
}
