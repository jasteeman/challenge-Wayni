import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeudorDto {
    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'id', example: '2313215' })
    readonly _id: string;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ description: 'Situación desfavorable', example: '2313215' })
    readonly situacion_desfavorable: number;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ description: 'Suma de prestamos', example: '2313215' })
    readonly suma_prestamos: number;
 
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ description: 'Número de identificación', example: '123456789' })
    readonly numero_identificacion: number;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Codigo identidad', example: '123456789' })
    readonly codigo_entidad: string; 
}