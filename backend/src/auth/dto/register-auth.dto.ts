import { IsNotEmpty, IsString, MinLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterAuthDto {
  @ApiProperty({ description: 'Nombre de usuario', example: 'jdoe' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'Correo electrónico', example: 'jdoe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ description: 'Apellido del usuario', example: 'Pérez' })
  @IsNotEmpty()
  @IsString()
  apellido: string; 

  @ApiProperty({ description: 'Contraseña del usuario (mínimo 6 caracteres)', minLength: 6, example: 'secreta123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
