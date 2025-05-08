import { Test, TestingModule } from '@nestjs/testing';
import { DeudoresController } from './deudores.controller'; 
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';
import { DeudoresService } from 'src/deudores/services/deudores.service';
import { CreateDeudorDto } from 'src/deudores/dto/create-deudor.dto';
import { Deudor } from 'src/deudores/entities/deudor.entity';

// Mock del servicio DeudoresService
const mockDeudoresService = {
  saveOrUpdate: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  deleteById: jest.fn(),
};

describe('DeudoresController', () => {
  let deudoresController: DeudoresController;
  let deudoresService: DeudoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeudoresController],
      providers: [
        { provide: DeudoresService, useValue: mockDeudoresService },
      ],
    }).compile();

    deudoresController = module.get<DeudoresController>(DeudoresController);
    deudoresService = module.get<DeudoresService>(DeudoresService);
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(deudoresController).toBeDefined();
  });

  describe('create', () => {
    it('debería llamar al servicio create con el DTO proporcionado', async () => {
      const createDeudorDto: CreateDeudorDto = {
        _id: '123',
        situacion_desfavorable: 5,
        suma_prestamos: 1000,
        numero_identificacion: 123,
        codigo_entidad:'1234'
      };
      const deudorCreado: Deudor = { 
        _id: '123',
        situacion_desfavorable: 5,
        suma_prestamos: 1000,
        numero_identificacion: 123,
        codigo_entidad:'1234'
      };
      (mockDeudoresService.saveOrUpdate as jest.Mock).mockResolvedValue(deudorCreado);

      const resultado = await deudoresController.create(createDeudorDto);
      expect(mockDeudoresService.saveOrUpdate).toHaveBeenCalledWith(createDeudorDto);
      expect(resultado).toEqual(deudorCreado);
    });
  });

  describe('findAll', () => {
    it('debería llamar al servicio findAll con las opciones de paginación correctas', async () => {
      const options: PaginationOptions = {page: 1, limit: 10, q: 'test' };
      const resultadoPaginado: PaginatedResult<Deudor> = {
        data: [],
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
      };
      (mockDeudoresService.findAll as jest.Mock).mockResolvedValue(resultadoPaginado);

      const resultado = await deudoresController.findAll('00007',1, 10, 'test');
      expect(mockDeudoresService.findAll).toHaveBeenCalledWith('00007',options);
      expect(resultado).toEqual(resultadoPaginado);
    });
  });

  describe('findOne', () => {
    it('debería llamar al servicio findById con el ID proporcionado', async () => {
      const deudorEncontrado: Deudor = {
        _id: '123',
        situacion_desfavorable: 5,
        suma_prestamos: 1000,
        numero_identificacion: 123,
        codigo_entidad:'1234'
      };
      (mockDeudoresService.findById as jest.Mock).mockResolvedValue(deudorEncontrado);

      const resultado = await deudoresController.findOne('123');
      expect(mockDeudoresService.findById).toHaveBeenCalledWith('123');
      expect(resultado).toEqual(deudorEncontrado);
    });
  });

  describe('delete', () => {
    it('debería llamar al servicio deleteById con el ID proporcionado', async () => {
      (mockDeudoresService.deleteById as jest.Mock).mockResolvedValue(undefined);

      await deudoresController.delete('123');
      expect(mockDeudoresService.deleteById).toHaveBeenCalledWith('123');
    });
  });
});
