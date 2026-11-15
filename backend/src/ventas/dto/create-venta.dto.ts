import { TipoProducto } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateVentaDto {
  @IsString()
  @IsNotEmpty({ message: 'El comprador es obligatorio.' })
  comprador!: string;

  @IsEnum(TipoProducto, {
    message: 'El tipo de producto debe ser CEREZA, PERGAMINO_HUMEDO o PERGAMINO_SECO.',
  })
  tipoProducto!: TipoProducto;

  @IsNumber({}, { message: 'La cantidad debe ser un número.' })
  @IsPositive({ message: 'La cantidad debe ser mayor que 0 kg.' })
  cantidadKg!: number;

  @IsNumber({}, { message: 'El valor total debe ser un número.' })
  @IsPositive({ message: 'El valor total debe ser mayor que 0.' })
  valorTotal!: number;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true, message: 'Alguno de los lotes de origen no es válido.' })
  loteIds?: string[];
}
