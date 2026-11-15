export type TipoProducto = "CEREZA" | "PERGAMINO_HUMEDO" | "PERGAMINO_SECO";
export type EstadoCosecha = "REGISTRADA" | "CONFIRMADA";

export const TIPOS_PRODUCTO: { valor: TipoProducto; etiqueta: string }[] = [
  { valor: "CEREZA", etiqueta: "Cereza" },
  { valor: "PERGAMINO_HUMEDO", etiqueta: "Pergamino húmedo" },
  { valor: "PERGAMINO_SECO", etiqueta: "Pergamino seco" },
];

export function etiquetaProducto(tipo: TipoProducto): string {
  return TIPOS_PRODUCTO.find((t) => t.valor === tipo)?.etiqueta ?? tipo;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: "ADMINISTRADOR" | "PRODUCTOR" | "TRABAJADOR";
  finca: { id: string; nombre: string };
}

export interface SesionRespuesta {
  accessToken: string;
}

export interface Lote {
  id: string;
  nombre: string;
  areaHa: string;
  tipoCultivo: string;
  creadoEn: string;
}

export interface Cosecha {
  id: string;
  fecha: string;
  cantidadKg: string;
  tipoProducto: TipoProducto;
  estado: EstadoCosecha;
  loteId: string;
  lote?: { nombre: string };
}

export interface FilaInventario {
  tipoProducto: TipoProducto;
  cantidadKg: string;
}

export interface Venta {
  id: string;
  comprador: string;
  tipoProducto: TipoProducto;
  cantidadKg: string;
  valorTotal: string;
  origenNoEspecificado: boolean;
  creadaEn: string;
  lotes: { loteId: string }[];
}
