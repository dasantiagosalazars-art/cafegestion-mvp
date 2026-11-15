"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { api, ApiError, clearToken, getToken } from "@/lib/api";
import type { Usuario } from "@/lib/types";

interface AuthContextValue {
  usuario: Usuario;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthGate>.");
  return ctx;
}

/** Protege las rutas privadas: sin token válido redirige a /login. */
export function AuthGate({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const cerrarSesion = useCallback(() => {
    clearToken();
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api<Usuario>("/auth/me")
      .then(setUsuario)
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          cerrarSesion();
        }
      });
  }, [router, cerrarSesion]);

  const valor = useMemo(() => (usuario ? { usuario, cerrarSesion } : null), [usuario, cerrarSesion]);

  if (!valor) {
    return <div className="text-muted-foreground p-6 text-sm">Cargando…</div>;
  }
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
