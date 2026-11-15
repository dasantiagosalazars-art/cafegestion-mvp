import type { ReactNode } from "react";

import { AppLogo } from "@/components/app-logo";

/** Marco de las pantallas de acceso (basado en el login "split screen" de la plantilla). */
export function AuthShell({ titulo, descripcion, children }: Readonly<{ titulo: string; descripcion: string; children: ReactNode }>) {
  return (
    <div className="flex h-dvh">
      <div className="bg-primary hidden lg:block lg:w-1/3">
        <div className="flex h-full flex-col items-center justify-center p-12 text-center">
          <div className="space-y-6">
            <AppLogo className="text-primary-foreground mx-auto size-14" />
            <div className="space-y-2">
              <h1 className="text-primary-foreground text-5xl font-light">CafeGestión</h1>
              <p className="text-primary-foreground/80 text-xl">Tu finca, ordenada.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-background flex w-full items-center justify-center p-8 lg:w-2/3">
        <div className="w-full max-w-md space-y-8 py-12">
          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">{titulo}</h2>
            <p className="text-muted-foreground">{descripcion}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
