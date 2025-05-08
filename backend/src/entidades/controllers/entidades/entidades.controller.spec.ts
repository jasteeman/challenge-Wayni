import { Test, TestingModule } from '@nestjs/testing';
import { EntidadesController } from './entidades.controller'; 
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';
import { EntidadesService } from 'src/entidades/services/entidades.service';
import { CreateEntityDto } from 'src/entidades/dto/create-entity.dto';
import { Entidad } from 'src/entidades/entities/entidad.entity';

// Mock del servicio EntidadesService
const mockEntidadesService = {
  saveOrUpdate: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  deleteById: jest.fn(),
};

describe('EntidadesController', () => {
  let entidadesController: EntidadesController;
  let entidadesService: EntidadesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntidadesController],
      providers: [
        { provide: EntidadesService, useValue: mockEntidadesService },
      ],
    }).compile();

    entidadesController = module.get<EntidadesController>(EntidadesController);
    entidadesService = module.get<EntidadesService>(EntidadesService);
    jest.clearAllMocks(); // Limpiar mocks antes de cada test
  });

  it('debería estar definido', () => {
    expect(entidadesController).toBeDefined();
  });

  describe('create', () => {
    it('debería llamar al servicio create con el DTO proporcionado', async () => {
      const createEntityDto: CreateEntityDto = {
        _id: '123',
        suma_prestamos: 1000,
        codigo_entidad: 123,
      };
      const entidadCreada: Entidad = {
        _id: '123',
        suma_prestamos: 1000,
        codigo_entidad: 123,
      };
      (mockEntidadesService.saveOrUpdate as jest.Mock).mockResolvedValue(entidadCreada);

      const resultado = await entidadesController.create(createEntityDto);
      expect(mockEntidadesService.saveOrUpdate).toHaveBeenCalledWith(createEntityDto);
      expect(resultado).toEqual(entidadCreada);
    });
  });

  describe('findAll', () => {
    it('debería llamar al servicio findAll con las opciones de paginación correctas', async () => {
      const options: PaginationOptions = { page: 1, limit: 10, q: 'test' };
      const resultadoPaginado: PaginatedResult<Entidad> = {
        data: [],
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
      };
      (mockEntidadesService.findAll as jest.Mock).mockResolvedValue(resultadoPaginado);

      const resultado = await entidadesController.findAll(1, 10, 'test');
      expect(mockEntidadesService.findAll).toHaveBeenCalledWith(options);
      expect(resultado).toEqual(resultadoPaginado);
    });
  });

  describe('findOne', () => {
    it('debería llamar al servicio findById con el ID proporcionado', async () => {
      const entidadEncontrada: Entidad = { 
        _id: '123',
        suma_prestamos: 1000,
        codigo_entidad: 123,
      };
      (mockEntidadesService.findById as jest.Mock).mockResolvedValue(entidadEncontrada);

      const resultado = await entidadesController.findOne('123');
      expect(mockEntidadesService.findById).toHaveBeenCalledWith('123');
      expect(resultado).toEqual(entidadEncontrada);
    });
  });

  describe('delete', () => {
    it('debería llamar al servicio deleteById con el ID proporcionado', async () => {
      (mockEntidadesService.deleteById as jest.Mock).mockResolvedValue(undefined);

      await entidadesController.delete('123');
      expect(mockEntidadesService.deleteById).toHaveBeenCalledWith('123');
    });
  });
});
