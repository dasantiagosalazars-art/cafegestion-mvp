"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearKg } from "@/lib/api";
import { etiquetaProducto, type FilaInventario } from "@/lib/types";
import { useApiData } from "@/lib/use-api-data";

export default function InventarioPage() {
  const { datos, cargando, error } = useApiData<FilaInventario[]>("/inventario");

  return (
    <div>
      <PageHeader
        titulo="Inventario"
        descripcion="Existencias por tipo de producto. Aumenta al confirmar una cosecha y disminuye al registrar una venta."
      />
      {cargando && <p className="text-muted-foreground text-sm">Cargando inventario…</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        {(datos ?? []).map((fila) => (
          <Card key={fila.tipoProducto} data-testid={`inventario-${fila.tipoProducto}`}>
            <CardHeader>
              <CardDescription>{etiquetaProducto(fila.tipoProducto)}</CardDescription>
              <CardTitle className="text-3xl">{formatearKg(fila.cantidadKg)}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-xs">Disponible para la venta</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
