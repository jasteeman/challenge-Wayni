import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterAuthDto } from '../dto/register-auth.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LoginAuthDto } from '../dto/login-auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Inicio de sesión exitoso' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Credenciales inválidas' })
  async login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Usuario registrado con éxito' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Solicitud incorrecta' })
  @ApiBody({ type: RegisterAuthDto })
  async register(@Body() registerAuthDto: RegisterAuthDto) {
    return this.authService.register(registerAuthDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('protected')
  @ApiOperation({ summary: 'Ruta protegida (requiere token JWT)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Ruta protegida accesible' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token JWT inválido' })
  async protectedRoute(@Request() req: any) {
    return { message: 'Esta ruta está protegida y solo accesible con un token JWT válido.', user: req.user };
  }
}