"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, ApiError } from "@/lib/api";
import { type LoteValues, loteSchema } from "@/lib/schemas";
import type { Lote } from "@/lib/types";
import { useApiData } from "@/lib/use-api-data";

export default function LotesPage() {
  const { datos, cargando, error, recargar } = useApiData<Lote[]>("/lotes");
  const [enviando, setEnviando] = useState(false);
  const form = useForm<LoteValues>({
    resolver: zodResolver(loteSchema),
    defaultValues: { nombre: "", tipoCultivo: "Café" },
  });

  async function onSubmit(valores: LoteValues) {
    setEnviando(true);
    try {
      await api<Lote>("/lotes", { method: "POST", body: valores });
      toast.success("Lote registrado.");
      form.reset({ nombre: "", tipoCultivo: "Café" });
      await recargar();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "No se pudo registrar el lote.");
    } finally {
      setEnviando(false);
    }
  }

  const err = form.formState.errors;

  return (
    <div className="space-y-6">
      <PageHeader titulo="Lotes" descripcion="Parcelas de su finca. Cada cosecha se asocia a un lote." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registrar lote</CardTitle>
        </CardHeader>
        <CardContent>
          <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-4 sm:items-start">
            <FieldGroup className="contents">
              <Field className="gap-1.5" data-invalid={Boolean(err.nombre)}>
                <FieldLabel htmlFor="lote-nombre">Nombre del lote</FieldLabel>
                <Input id="lote-nombre" {...form.register("nombre")} />
                {err.nombre && <FieldError errors={[err.nombre]} />}
              </Field>
              <Field className="gap-1.5" data-invalid={Boolean(err.areaHa)}>
                <FieldLabel htmlFor="lote-area">Área (ha)</FieldLabel>
                <Input id="lote-area" type="number" step="0.01" {...form.register("areaHa", { valueAsNumber: true })} />
                {err.areaHa && <FieldError errors={[err.areaHa]} />}
              </Field>
              <Field className="gap-1.5" data-invalid={Boolean(err.tipoCultivo)}>
                <FieldLabel htmlFor="lote-cultivo">Tipo de cultivo</FieldLabel>
                <Input id="lote-cultivo" {...form.register("tipoCultivo")} />
                {err.tipoCultivo && <FieldError errors={[err.tipoCultivo]} />}
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={enviando} className="sm:mt-6">
              {enviando ? "Guardando…" : "Registrar lote"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {cargando && <p className="text-muted-foreground text-sm">Cargando lotes…</p>}
          {error && <p className="text-destructive text-sm">{error}</p>}
          {datos && datos.length === 0 && <p className="text-muted-foreground text-sm">Aún no hay lotes. Registre el primero arriba.</p>}
          {datos && datos.length > 0 && (
            <Table data-testid="tabla-lotes">
              <TableHeader>
                <TableRow>
                  <TableHead>Lote</TableHead>
                  <TableHead>Área (ha)</TableHead>
                  <TableHead>Cultivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datos.map((lote) => (
                  <TableRow key={lote.id}>
                    <TableCell className="font-medium">{lote.nombre}</TableCell>
                    <TableCell>{Number(lote.areaHa).toLocaleString("es-CO")}</TableCell>
                    <TableCell>{lote.tipoCultivo}</TableCell>
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
