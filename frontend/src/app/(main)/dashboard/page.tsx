"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/components/auth-provider";
import { formatearKg } from "@/lib/api";
import type { Cosecha, FilaInventario, Lote, Venta } from "@/lib/types";
import { etiquetaProducto } from "@/lib/types";
import { useApiData } from "@/lib/use-api-data";

export default function InicioPage() {
  const { usuario } = useAuth();
  const inventario = useApiData<FilaInventario[]>("/inventario");
  const lotes = useApiData<Lote[]>("/lotes");
  const cosechas = useApiData<Cosecha[]>("/cosechas");
  const ventas = useApiData<Venta[]>("/ventas");

  const pendientes = cosechas.datos?.filter((c) => c.estado === "REGISTRADA").length ?? 0;

  return (
    <div>
      <PageHeader titulo={`Finca ${usuario.finca.nombre}`} descripcion="Resumen de su producción y su inventario." />

      <h2 className="mb-3 text-sm font-medium">Inventario actual</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-3" data-testid="resumen-inventario">
        {(inventario.datos ?? []).map((fila) => (
          <Card key={fila.tipoProducto}>
            <CardHeader>
              <CardDescription>{etiquetaProducto(fila.tipoProducto)}</CardDescription>
              <CardTitle className="text-3xl">{formatearKg(fila.cantidadKg)}</CardTitle>
            </CardHeader>
          </Card>
        ))}
        {inventario.cargando && <p className="text-muted-foreground text-sm">Cargando inventario…</p>}
        {inventario.error && <p className="text-destructive text-sm">{inventario.error}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Lotes registrados</CardDescription>
            <CardTitle className="text-3xl">{lotes.datos?.length ?? "–"}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Cosechas por confirmar</CardDescription>
            <CardTitle className="text-3xl">{cosechas.datos ? pendientes : "–"}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">Solo las confirmadas suman al inventario.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Ventas registradas</CardDescription>
            <CardTitle className="text-3xl">{ventas.datos?.length ?? "–"}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
