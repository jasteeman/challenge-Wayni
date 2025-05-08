import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEntityDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'id', example: '2313215' })
  readonly _id: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: 'Suma prestamos', example: '2313215' })
  readonly suma_prestamos: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: 'Código entidad', example: '12345' })
  readonly codigo_entidad: number;
}