import {
  Controller, Get, Post, Body, Param, Delete, Query,
  DefaultValuePipe, ParseIntPipe, ValidationPipe, UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';
import { CreateDeudorDto } from 'src/deudores/dto/create-deudor.dto';
import { Deudor } from 'src/deudores/entities/deudor.entity';
import { DeudoresService } from 'src/deudores/services/deudores.service';

@ApiTags('deudores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deudores')
export class DeudoresController {
  constructor(private readonly deudoresService: DeudoresService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo deudor' })
  @ApiResponse({ status: 201, description: 'Deudor creado con éxito' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  @ApiBody({ type: CreateDeudorDto })
  async create(@Body(ValidationPipe) createDeudorDto: CreateDeudorDto): Promise<Deudor> {
    return this.deudoresService.saveOrUpdate(createDeudorDto);
  }

  @Get("findAll/:id")
  @ApiOperation({ summary: 'Obtener lista de deudores (con filtros y paginación)' })
  @ApiResponse({ status: 200, description: 'Lista de deudores obtenida con éxito' })
  @ApiParam({ name: 'id', description: 'ID del entidad' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Cantidad por página' })
  @ApiQuery({ name: 'q', required: false, description: 'Término de búsqueda' })
  async findAll(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('q') q: string,
  ): Promise<PaginatedResult<Deudor>> {
    const options: PaginationOptions = { page, limit, q };
    return this.deudoresService.findAll(id,options);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un deudor por ID' })
  @ApiResponse({ status: 200, description: 'Deudor obtenido con éxito' })
  @ApiResponse({ status: 404, description: 'Deudor no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del deudor' })
  async findOne(@Param('id') id: string): Promise<Deudor | null> {
    return this.deudoresService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un deudor por ID' })
  @ApiResponse({ status: 200, description: 'Deudor eliminado con éxito' })
  @ApiResponse({ status: 404, description: 'Deudor no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del deudor' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deudoresService.deleteById(id);
  }
}
