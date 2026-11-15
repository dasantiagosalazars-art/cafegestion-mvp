import { IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateLoteDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del lote es obligatorio.' })
  @MaxLength(100, { message: 'El nombre no puede superar 100 caracteres.' })
  nombre!: string;

  @IsNumber({}, { message: 'El área debe ser un número.' })
  @IsPositive({ message: 'El área debe ser mayor que 0 hectáreas.' })
  areaHa!: number;

  @IsString()
  @IsNotEmpty({ message: 'El tipo de cultivo es obligatorio.' })
  tipoCultivo!: string;
}
