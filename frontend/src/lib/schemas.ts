import { z } from "zod";

/** Validaciones de formularios de dominio (espejo de las reglas de la API). */

export const loteSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, { message: "El nombre del lote es obligatorio." })
    .max(100, { message: "El nombre no puede superar 100 caracteres." }),
  areaHa: z.number({ error: "El área debe ser un número." }).positive({ message: "El área debe ser mayor que 0 hectáreas." }),
  tipoCultivo: z.string().trim().min(1, { message: "El tipo de cultivo es obligatorio." }),
});
export type LoteValues = z.infer<typeof loteSchema>;

export const cosechaSchema = z.object({
  loteId: z.string().min(1, { message: "Seleccione un lote." }),
  fecha: z.string().min(1, { message: "La fecha es obligatoria." }),
  cantidadKg: z.number({ error: "La cantidad debe ser un número." }).positive({ message: "La cantidad debe ser mayor que 0 kg." }),
  tipoProducto: z.enum(["CEREZA", "PERGAMINO_HUMEDO", "PERGAMINO_SECO"], { error: "Seleccione el tipo de producto." }),
});
export type CosechaValues = z.infer<typeof cosechaSchema>;

export const ventaSchema = z.object({
  comprador: z.string().trim().min(1, { message: "El comprador es obligatorio." }),
  tipoProducto: z.enum(["CEREZA", "PERGAMINO_HUMEDO", "PERGAMINO_SECO"], { error: "Seleccione el tipo de producto." }),
  cantidadKg: z.number({ error: "La cantidad debe ser un número." }).positive({ message: "La cantidad debe ser mayor que 0 kg." }),
  valorTotal: z.number({ error: "El valor total debe ser un número." }).positive({ message: "El valor total debe ser mayor que 0." }),
});
export type VentaValues = z.infer<typeof ventaSchema>;
