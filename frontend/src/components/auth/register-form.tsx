"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api, ApiError, setToken } from "@/lib/api";
import type { SesionRespuesta } from "@/lib/types";

export const registerSchema = z.object({
  nombre: z.string().trim().min(1, { message: "El nombre es obligatorio." }),
  nombreFinca: z.string().trim().min(1, { message: "El nombre de la finca es obligatorio." }),
  email: z.email({ message: "El correo electrónico no es válido." }),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
});
type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nombre: "", nombreFinca: "", email: "", password: "" },
  });

  async function onSubmit(valores: RegisterValues) {
    setEnviando(true);
    try {
      const sesion = await api<SesionRespuesta>("/auth/register", { method: "POST", body: valores });
      setToken(sesion.accessToken);
      toast.success("Cuenta creada. ¡Bienvenido!");
      router.replace("/dashboard");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No se pudo crear la cuenta.");
    } finally {
      setEnviando(false);
    }
  }

  const e = form.formState.errors;

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Field className="gap-1.5" data-invalid={Boolean(e.nombre)}>
          <FieldLabel htmlFor="reg-nombre">Su nombre</FieldLabel>
          <Input id="reg-nombre" autoComplete="name" {...form.register("nombre")} />
          {e.nombre && <FieldError errors={[e.nombre]} />}
        </Field>
        <Field className="gap-1.5" data-invalid={Boolean(e.nombreFinca)}>
          <FieldLabel htmlFor="reg-finca">Nombre de la finca</FieldLabel>
          <Input id="reg-finca" {...form.register("nombreFinca")} />
          {e.nombreFinca && <FieldError errors={[e.nombreFinca]} />}
        </Field>
        <Field className="gap-1.5" data-invalid={Boolean(e.email)}>
          <FieldLabel htmlFor="reg-email">Correo electrónico</FieldLabel>
          <Input id="reg-email" type="email" autoComplete="email" {...form.register("email")} />
          {e.email && <FieldError errors={[e.email]} />}
        </Field>
        <Field className="gap-1.5" data-invalid={Boolean(e.password)}>
          <FieldLabel htmlFor="reg-password">Contraseña (mínimo 8 caracteres)</FieldLabel>
          <Input id="reg-password" type="password" autoComplete="new-password" {...form.register("password")} />
          {e.password && <FieldError errors={[e.password]} />}
        </Field>
      </FieldGroup>
      <Button className="w-full" type="submit" disabled={enviando}>
        {enviando ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        ¿Ya tiene cuenta?{" "}
        <Link href="/login" className="text-primary font-medium underline-offset-4 hover:underline">
          Inicie sesión
        </Link>
      </p>
    </form>
  );
}
