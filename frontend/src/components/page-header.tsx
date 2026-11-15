import type { ReactNode } from "react";

export function PageHeader({ titulo, descripcion, children }: Readonly<{ titulo: string; descripcion?: string; children?: ReactNode }>) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        {descripcion && <p className="text-muted-foreground mt-1 text-sm">{descripcion}</p>}
      </div>
      {children}
    </div>
  );
}
