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

export const loginSchema = z.object({
  email: z.email({ message: "El correo electrónico no es válido." }),
  password: z.string().min(1, { message: "La contraseña es obligatoria." }),
});
type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(valores: LoginValues) {
    setEnviando(true);
    try {
      const sesion = await api<SesionRespuesta>("/auth/login", { method: "POST", body: valores });
      setToken(sesion.accessToken);
      router.replace("/dashboard");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No se pudo iniciar sesión.");
    } finally {
      setEnviando(false);
    }
  }

  const errores = form.formState.errors;

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Field className="gap-1.5" data-invalid={Boolean(errores.email)}>
          <FieldLabel htmlFor="login-email">Correo electrónico</FieldLabel>
          <Input id="login-email" type="email" autoComplete="email" placeholder="usted@finca.com" {...form.register("email")} />
          {errores.email && <FieldError errors={[errores.email]} />}
        </Field>
        <Field className="gap-1.5" data-invalid={Boolean(errores.password)}>
          <FieldLabel htmlFor="login-password">Contraseña</FieldLabel>
          <Input id="login-password" type="password" autoComplete="current-password" {...form.register("password")} />
          {errores.password && <FieldError errors={[errores.password]} />}
        </Field>
      </FieldGroup>
      <Button className="w-full" type="submit" disabled={enviando}>
        {enviando ? "Ingresando…" : "Iniciar sesión"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        ¿No tiene cuenta?{" "}
        <Link href="/register" className="text-primary font-medium underline-offset-4 hover:underline">
          Regístrese
        </Link>
      </p>
    </form>
  );
}
