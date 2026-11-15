import { TipoProducto } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateCosechaDto {
  @IsUUID('all', { message: 'El lote indicado no es válido.' })
  loteId!: string;

  @IsDateString({}, { message: 'La fecha no es válida (use AAAA-MM-DD).' })
  fecha!: string;

  @IsNumber({}, { message: 'La cantidad debe ser un número.' })
  @IsPositive({ message: 'La cantidad debe ser mayor que 0 kg.' })
  cantidadKg!: number;

  @IsEnum(TipoProducto, {
    message: 'El tipo de producto debe ser CEREZA, PERGAMINO_HUMEDO o PERGAMINO_SECO.',
  })
  tipoProducto!: TipoProducto;
}
