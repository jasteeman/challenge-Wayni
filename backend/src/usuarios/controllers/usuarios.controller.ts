import { Controller, Post, Body, Patch, Param, Delete, Get, UsePipes, ValidationPipe, UseGuards, Query } from '@nestjs/common';
import { UsuariosService } from '../services/usuarios.service';
import { CreateUsuarioDto, UpdateUsuarioDto } from '../dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
@ApiTags('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado con éxito' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  @ApiBody({ type: CreateUsuarioDto })
  async create(@Body() createUserDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUserDto);
  }

  @Get('list')
   @ApiOperation({ summary: 'Obtener lista de usuarios (con filtros y paginación)' })
   @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida con éxito' })
   @ApiQuery({ name: 'search', required: false, description: 'Término de búsqueda' })
   @ApiQuery({ name: 'page', required: false, type: 'number', description: 'Número de página' })
   @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Cantidad de usuarios por página' })
   async findAll(
     @Query('search') search?: string,
     @Query('page') page = '1',
     @Query('limit') limit = '10',
   ) {
     return await this.usuariosService.findAll({
       page: parseInt(page, 10),
       limit: parseInt(limit, 10),
       q: search?.trim() || undefined,
     });
   }

  @Get('getById/:id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario obtenido con éxito' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async findOne(@Param('id') id: string) {
    const user = await this.usuariosService.findOne(id);
    return user;
  }

  @Patch('path/:id')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Actualizar un usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado con éxito' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiBody({ type: UpdateUsuarioDto })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUserDto);
  }

  @Delete('remove/:id')
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado con éxito' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async remove(@Param('id') id: string) {
    await this.usuariosService.remove(id);
    return { message: `Usuario con ID ${id} eliminado` };
  }
}