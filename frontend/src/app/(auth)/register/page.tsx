import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Crear cuenta · CafeGestión" };

export default function RegisterPage() {
  return (
    <AuthShell titulo="Crear cuenta" descripcion="Registre su finca y empiece a controlar lotes, cosechas e inventario.">
      <RegisterForm />
    </AuthShell>
  );
}
