import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { DeudoresService } from './deudores.service';
import { Deudor } from '../entities/deudor.entity';
import { CreateDeudorDto } from '../dto/create-deudor.dto';
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';

const mockDeudorRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

describe('DeudoresService', () => {
  let deudoresService: DeudoresService;
  let deudorRepository: MongoRepository<Deudor>;

  const mockDeudor = {
    _id: '123',
    situacion_desfavorable: 1,
    suma_prestamos: 100,
    numero_identificacion: 123
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeudoresService,
        {
          provide: getRepositoryToken(Deudor),
          useValue: mockDeudorRepository,
        },
      ],
    }).compile();

    deudoresService = module.get<DeudoresService>(DeudoresService);
    deudorRepository = module.get<MongoRepository<Deudor>>(getRepositoryToken(Deudor));
  });

  it('debería estar definido', () => {
    expect(deudoresService).toBeDefined();
  });

  describe('saveOrUpdate', () => {
    it('debería crear un nuevo deudor si no existe', async () => {
      const deudorData: CreateDeudorDto = {
        _id: '123',
        situacion_desfavorable: 5,
        suma_prestamos: 1000,
        numero_identificacion: 123,
        codigo_entidad: '1234'
      };
      const nuevoDeudor = { ...deudorData, id: 'algún-id', codigo_entidad: '1234' } as Deudor;
      (deudorRepository.findOne as jest.Mock).mockResolvedValue(undefined);
      (deudorRepository.create as jest.Mock).mockReturnValue(nuevoDeudor);
      (deudorRepository.save as jest.Mock).mockResolvedValue(nuevoDeudor);

      const resultado = await deudoresService.saveOrUpdate(deudorData);
      expect(deudorRepository.findOne).toHaveBeenCalledWith({ where: { _id: deudorData._id } });
      expect(deudorRepository.create).toHaveBeenCalledWith(deudorData);
      expect(deudorRepository.save).toHaveBeenCalledWith(nuevoDeudor);
      expect(resultado).toEqual(nuevoDeudor);
    });

    it('debería actualizar un deudor existente', async () => {
      const deudorExistente: Deudor = {
        _id: '123',
        situacion_desfavorable: 3,
        suma_prestamos: 500,
        numero_identificacion: 123,
        codigo_entidad: '1234'
      };
      const deudorData: CreateDeudorDto = {
        _id: '123',
        situacion_desfavorable: 5,
        suma_prestamos: 1000,
        numero_identificacion: 123,
        codigo_entidad: "1234"
      };
      const deudorActualizado = {
        ...deudorExistente,
        situacion_desfavorable: 5,
        suma_prestamos: 1500,
      };
      (deudorRepository.findOne as jest.Mock).mockResolvedValue(deudorExistente);
      (deudorRepository.save as jest.Mock).mockResolvedValue(deudorActualizado);

      const resultado = await deudoresService.saveOrUpdate(deudorData);
      expect(deudorRepository.findOne).toHaveBeenCalledWith({ where: { _id: deudorData._id } });
      expect(deudorRepository.save).toHaveBeenCalledWith(deudorActualizado);
      expect(resultado).toEqual(deudorActualizado);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      mockDeudorRepository.findAndCount.mockResolvedValue([[mockDeudor], 1]);

      const result = await deudoresService.findAll('00007',{ page: 1, limit: 10 });

      expect(result.data).toEqual([mockDeudor]);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should handle empty query', async () => {
      mockDeudorRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await deudoresService.findAll('00007',{ page: 1, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should search users with q using Like', async () => {
      const q = '123';
      mockDeudorRepository.findAndCount.mockResolvedValue([[mockDeudor], 1]);

      const result = await deudoresService.findAll('00007',{ page: 1, limit: 10, q });

      expect(result.data).toEqual([mockDeudor]);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

  });
  describe('findById', () => {
    it('debería retornar un deudor si se encuentra', async () => {
      const deudor: Deudor = { _id: '123', situacion_desfavorable: 1, suma_prestamos: 100, numero_identificacion: 123, codigo_entidad: '1234' };
      (deudorRepository.findOne as jest.Mock).mockResolvedValue(deudor);

      const resultado = await deudoresService.findById('123');
      expect(deudorRepository.findOne).toHaveBeenCalledWith({ where: { _id: '123' } });
      expect(resultado).toEqual(deudor);
    });

    it('debería retornar null si no se encuentra el deudor', async () => {
      (deudorRepository.findOne as jest.Mock).mockResolvedValue(null);

      const resultado = await deudoresService.findById('non-existent-id');
      expect(deudorRepository.findOne).toHaveBeenCalledWith({ where: { _id: 'non-existent-id' } });
      expect(resultado).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('debería eliminar un deudor por su ID', async () => {
      (deudorRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 }); // Simula eliminación exitosa

      await deudoresService.deleteById('123');
      expect(deudorRepository.delete).toHaveBeenCalledWith({ _id: '123' });
    });
  });
});
