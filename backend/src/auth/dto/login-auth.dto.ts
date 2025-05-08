import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty({ description: 'Nombre de usuario', example: 'jdoe' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'secreta123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
