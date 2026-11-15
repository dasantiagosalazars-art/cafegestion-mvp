"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, ApiError, formatearCOP, formatearFecha, formatearKg } from "@/lib/api";
import { type VentaValues, ventaSchema } from "@/lib/schemas";
import { etiquetaProducto, type Lote, TIPOS_PRODUCTO, type Venta } from "@/lib/types";
import { useApiData } from "@/lib/use-api-data";

export default function VentasPage() {
  const ventas = useApiData<Venta[]>("/ventas");
  const lotes = useApiData<Lote[]>("/lotes");
  const [enviando, setEnviando] = useState(false);
  const [loteIds, setLoteIds] = useState<string[]>([]);

  const form = useForm<VentaValues>({
    resolver: zodResolver(ventaSchema),
    defaultValues: { comprador: "", tipoProducto: "PERGAMINO_SECO" },
  });

  function alternarLote(id: string) {
    setLoteIds((actual) => (actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]));
  }

  async function onSubmit(valores: VentaValues) {
    setEnviando(true);
    try {
      await api<Venta>("/ventas", { method: "POST", body: { ...valores, loteIds } });
      toast.success("Venta registrada e inventario descontado.");
      form.reset({ comprador: "", tipoProducto: valores.tipoProducto });
      setLoteIds([]);
      await ventas.recargar();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "No se pudo registrar la venta.");
    } finally {
      setEnviando(false);
    }
  }

  const err = form.formState.errors;

  return (
    <div className="space-y-6">
      <PageHeader titulo="Ventas" descripcion="Registre lo que vende. La cantidad se descuenta del inventario y no puede superarlo." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registrar venta</CardTitle>
        </CardHeader>
        <CardContent>
          <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-4 sm:items-start">
              <FieldGroup className="contents">
                <Field className="gap-1.5" data-invalid={Boolean(err.comprador)}>
                  <FieldLabel htmlFor="ven-comprador">Comprador</FieldLabel>
                  <Input id="ven-comprador" {...form.register("comprador")} />
                  {err.comprador && <FieldError errors={[err.comprador]} />}
                </Field>
                <Field className="gap-1.5" data-invalid={Boolean(err.tipoProducto)}>
                  <FieldLabel htmlFor="ven-tipo">Producto</FieldLabel>
                  <NativeSelect id="ven-tipo" className="w-full" {...form.register("tipoProducto")}>
                    {TIPOS_PRODUCTO.map((t) => (
                      <NativeSelectOption key={t.valor} value={t.valor}>
                        {t.etiqueta}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  {err.tipoProducto && <FieldError errors={[err.tipoProducto]} />}
                </Field>
                <Field className="gap-1.5" data-invalid={Boolean(err.cantidadKg)}>
                  <FieldLabel htmlFor="ven-cantidad">Cantidad (kg)</FieldLabel>
                  <Input id="ven-cantidad" type="number" step="0.01" {...form.register("cantidadKg", { valueAsNumber: true })} />
                  {err.cantidadKg && <FieldError errors={[err.cantidadKg]} />}
                </Field>
                <Field className="gap-1.5" data-invalid={Boolean(err.valorTotal)}>
                  <FieldLabel htmlFor="ven-valor">Valor total (COP)</FieldLabel>
                  <Input id="ven-valor" type="number" step="1" {...form.register("valorTotal", { valueAsNumber: true })} />
                  {err.valorTotal && <FieldError errors={[err.valorTotal]} />}
                </Field>
              </FieldGroup>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium">Lotes de origen (opcional)</legend>
              {lotes.datos && lotes.datos.length === 0 && <p className="text-muted-foreground text-sm">No hay lotes registrados.</p>}
              <div className="flex flex-wrap gap-4">
                {(lotes.datos ?? []).map((l) => (
                  <label key={l.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={loteIds.includes(l.id)} onChange={() => alternarLote(l.id)} className="accent-primary size-4" />
                    {l.nombre}
                  </label>
                ))}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">Si no marca ninguno, la venta se guarda con “origen no especificado”.</p>
            </fieldset>

            <Button type="submit" disabled={enviando}>
              {enviando ? "Guardando…" : "Registrar venta"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {ventas.cargando && <p className="text-muted-foreground text-sm">Cargando ventas…</p>}
          {ventas.error && <p className="text-destructive text-sm">{ventas.error}</p>}
          {ventas.datos && ventas.datos.length === 0 && <p className="text-muted-foreground text-sm">Aún no hay ventas registradas.</p>}
          {ventas.datos && ventas.datos.length > 0 && (
            <Table data-testid="tabla-ventas">
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Comprador</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Origen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventas.datos.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{formatearFecha(v.creadaEn)}</TableCell>
                    <TableCell className="font-medium">{v.comprador}</TableCell>
                    <TableCell>{etiquetaProducto(v.tipoProducto)}</TableCell>
                    <TableCell>{formatearKg(v.cantidadKg)}</TableCell>
                    <TableCell>{formatearCOP(v.valorTotal)}</TableCell>
                    <TableCell>
                      {v.origenNoEspecificado ? <Badge variant="outline">No especificado</Badge> : <Badge variant="secondary">{v.lotes.length} lote(s)</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
