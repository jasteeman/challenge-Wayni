import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';
import { CreateEntityDto } from 'src/entidades/dto/create-entity.dto';
import { Entidad } from 'src/entidades/entities/entidad.entity';
import { EntidadesService } from 'src/entidades/services/entidades.service';

@ApiTags('entidades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('entidades')
export class EntidadesController {
  constructor(private readonly entidadesService: EntidadesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva entidad' })
  @ApiResponse({ status: 201, description: 'Entidad creada con éxito', type: Entidad })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiBody({ type: CreateEntityDto })
  async create(@Body(ValidationPipe) createEntityDto: CreateEntityDto): Promise<Entidad> {
    return this.entidadesService.saveOrUpdate(createEntityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener una lista paginada de entidades' })
  @ApiResponse({ status: 200, description: 'Lista de entidades obtenida con éxito' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Cantidad de entidades por página' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Filtro de búsqueda' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('q') q: string,
  ): Promise<PaginatedResult<Entidad>> {
    const options: PaginationOptions = { page, limit, q };
    return this.entidadesService.findAll(options);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una entidad por ID' })
  @ApiResponse({ status: 200, description: 'Entidad obtenida con éxito', type: Entidad })
  @ApiResponse({ status: 404, description: 'Entidad no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la entidad' })
  async findOne(@Param('id') id: string): Promise<Entidad | null> {
    return this.entidadesService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una entidad por ID' })
  @ApiResponse({ status: 200, description: 'Entidad eliminada con éxito' })
  @ApiResponse({ status: 404, description: 'Entidad no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la entidad' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.entidadesService.deleteById(id);
  }
}
