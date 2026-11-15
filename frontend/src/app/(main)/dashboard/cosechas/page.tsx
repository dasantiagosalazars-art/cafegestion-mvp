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
import { api, ApiError, formatearFecha, formatearKg } from "@/lib/api";
import { type CosechaValues, cosechaSchema } from "@/lib/schemas";
import { type Cosecha, etiquetaProducto, type Lote, TIPOS_PRODUCTO } from "@/lib/types";
import { useApiData } from "@/lib/use-api-data";

export default function CosechasPage() {
  const cosechas = useApiData<Cosecha[]>("/cosechas");
  const lotes = useApiData<Lote[]>("/lotes");
  const [enviando, setEnviando] = useState(false);
  // Al cambiar la clave el formulario se remonta y todos sus campos quedan vacíos.
  const [formKey, setFormKey] = useState(0);
  const [confirmando, setConfirmando] = useState<string | null>(null);

  const form = useForm<CosechaValues>({
    resolver: zodResolver(cosechaSchema),
    defaultValues: { loteId: "", fecha: new Date().toISOString().slice(0, 10), tipoProducto: "CEREZA" },
  });

  async function onSubmit(valores: CosechaValues) {
    setEnviando(true);
    try {
      await api<Cosecha>("/cosechas", { method: "POST", body: valores });
      toast.success("Cosecha registrada. Confírmela para sumarla al inventario.");
      form.reset({ loteId: "", fecha: valores.fecha, tipoProducto: valores.tipoProducto });
      setFormKey((k) => k + 1);
      await cosechas.recargar();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "No se pudo registrar la cosecha.");
    } finally {
      setEnviando(false);
    }
  }

  async function confirmar(id: string) {
    setConfirmando(id);
    try {
      await api<Cosecha>(`/cosechas/${id}/confirmar`, { method: "POST" });
      toast.success("Cosecha confirmada. El inventario fue actualizado.");
      await cosechas.recargar();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "No se pudo confirmar la cosecha.");
    } finally {
      setConfirmando(null);
    }
  }

  const err = form.formState.errors;
  const sinLotes = lotes.datos !== null && lotes.datos.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader titulo="Cosechas" descripcion="Registre lo recolectado por lote y confírmelo para que cuente en el inventario." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registrar cosecha</CardTitle>
        </CardHeader>
        <CardContent>
          {sinLotes && <p className="text-muted-foreground mb-4 text-sm">Primero registre al menos un lote en la sección Lotes.</p>}
          <form key={formKey} noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-5 sm:items-start">
            <FieldGroup className="contents">
              <Field className="gap-1.5" data-invalid={Boolean(err.loteId)}>
                <FieldLabel htmlFor="cos-lote">Lote</FieldLabel>
                <NativeSelect id="cos-lote" className="w-full" {...form.register("loteId")}>
                  <NativeSelectOption value="">Seleccione…</NativeSelectOption>
                  {(lotes.datos ?? []).map((l) => (
                    <NativeSelectOption key={l.id} value={l.id}>
                      {l.nombre}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {err.loteId && <FieldError errors={[err.loteId]} />}
              </Field>
              <Field className="gap-1.5" data-invalid={Boolean(err.fecha)}>
                <FieldLabel htmlFor="cos-fecha">Fecha</FieldLabel>
                <Input id="cos-fecha" type="date" {...form.register("fecha")} />
                {err.fecha && <FieldError errors={[err.fecha]} />}
              </Field>
              <Field className="gap-1.5" data-invalid={Boolean(err.cantidadKg)}>
                <FieldLabel htmlFor="cos-cantidad">Cantidad (kg)</FieldLabel>
                <Input id="cos-cantidad" type="number" step="0.01" {...form.register("cantidadKg", { valueAsNumber: true })} />
                {err.cantidadKg && <FieldError errors={[err.cantidadKg]} />}
              </Field>
              <Field className="gap-1.5" data-invalid={Boolean(err.tipoProducto)}>
                <FieldLabel htmlFor="cos-tipo">Producto</FieldLabel>
                <NativeSelect id="cos-tipo" className="w-full" {...form.register("tipoProducto")}>
                  {TIPOS_PRODUCTO.map((t) => (
                    <NativeSelectOption key={t.valor} value={t.valor}>
                      {t.etiqueta}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {err.tipoProducto && <FieldError errors={[err.tipoProducto]} />}
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={enviando} className="sm:mt-6">
              {enviando ? "Guardando…" : "Registrar cosecha"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {cosechas.cargando && <p className="text-muted-foreground text-sm">Cargando cosechas…</p>}
          {cosechas.error && <p className="text-destructive text-sm">{cosechas.error}</p>}
          {cosechas.datos && cosechas.datos.length === 0 && <p className="text-muted-foreground text-sm">Aún no hay cosechas registradas.</p>}
          {cosechas.datos && cosechas.datos.length > 0 && (
            <Table data-testid="tabla-cosechas">
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cosechas.datos.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{formatearFecha(c.fecha)}</TableCell>
                    <TableCell className="font-medium">{c.lote?.nombre ?? "–"}</TableCell>
                    <TableCell>{etiquetaProducto(c.tipoProducto)}</TableCell>
                    <TableCell>{formatearKg(c.cantidadKg)}</TableCell>
                    <TableCell>
                      <Badge variant={c.estado === "CONFIRMADA" ? "default" : "outline"}>
                        {c.estado === "CONFIRMADA" ? "Confirmada" : "Registrada"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {c.estado === "REGISTRADA" && (
                        <Button size="sm" disabled={confirmando === c.id} onClick={() => confirmar(c.id)}>
                          {confirmando === c.id ? "Confirmando…" : "Confirmar"}
                        </Button>
                      )}
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
