import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOperator, MongoRepository } from 'typeorm';
import { EntidadesService } from './entidades.service';
import { Entidad } from '../entities/entidad.entity';
import { CreateEntityDto } from '../dto/create-entity.dto';

const mockEntidadRepository ={
  findOne: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

describe('EntidadesService', () => {
  let entidadesService: EntidadesService;
  let entidadRepository: MongoRepository<Entidad>;
  const mockEntidad: Entidad = {
    _id: '123',
    codigo_entidad: 123,
    suma_prestamos: 500,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntidadesService,
        {
          provide: getRepositoryToken(Entidad),
          useValue: mockEntidadRepository,
        },
      ],
    }).compile();

    entidadesService = module.get<EntidadesService>(EntidadesService);
    entidadRepository = module.get<MongoRepository<Entidad>>(getRepositoryToken(Entidad));
  });

  it('debería estar definido', () => {
    expect(entidadesService).toBeDefined();
  });

  describe('saveOrUpdate', () => {
    it('debería crear una nueva entidad si no existe', async () => {
      const entidadData: CreateEntityDto = {
        _id: '123',
        suma_prestamos: 1000,
        codigo_entidad: 123,
      };
      const nuevaEntidad = { ...entidadData, _id: 'algún-id' } as Entidad; // Agregamos un id simulado
      (entidadRepository.findOne as jest.Mock).mockResolvedValue(undefined);
      (entidadRepository.create as jest.Mock).mockReturnValue(nuevaEntidad);
      (entidadRepository.save as jest.Mock).mockResolvedValue(nuevaEntidad);

      const resultado = await entidadesService.saveOrUpdate(entidadData);
      expect(entidadRepository.findOne).toHaveBeenCalledWith({ where: { _id: entidadData._id } });
      expect(entidadRepository.create).toHaveBeenCalledWith(entidadData);
      expect(entidadRepository.save).toHaveBeenCalledWith(nuevaEntidad);
      expect(resultado).toEqual(nuevaEntidad);
    });

    it('debería actualizar una entidad existente', async () => {
      
      const entidadData: CreateEntityDto = {
        _id: '123',
        codigo_entidad: 123,
        suma_prestamos: 1000,
      };
      const entidadActualizada = {
        ...mockEntidad,
        suma_prestamos: 1500,
      };
      (entidadRepository.findOne as jest.Mock).mockResolvedValue(mockEntidad);
      (entidadRepository.save as jest.Mock).mockResolvedValue(entidadActualizada);

      const resultado = await entidadesService.saveOrUpdate(entidadData);
      expect(entidadRepository.findOne).toHaveBeenCalledWith({ where: { _id: entidadData._id } });
      expect(entidadRepository.save).toHaveBeenCalledWith(entidadActualizada);
      expect(resultado).toEqual(entidadActualizada);
    });
  });
  describe('findAll', () => {
    it('should return paginated users', async () => {
      mockEntidadRepository.findAndCount.mockResolvedValue([[mockEntidad], 1]);

      const result = await entidadesService.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([mockEntidad]);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should handle empty query', async () => {
      mockEntidadRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await entidadesService.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should search users with q using Like', async () => {
      const q = '123';
      mockEntidadRepository.findAndCount.mockResolvedValue([[mockEntidad], 1]);
    
      const result = await entidadesService.findAll({ page: 1, limit: 10, q });
    
      expect(result.data).toEqual([mockEntidad]);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  
  });

  describe('findById', () => {
    it('debería retornar una entidad si se encuentra', async () => {
      const entidad: Entidad = {  _id: '123', suma_prestamos: 100, codigo_entidad: 123 };
      (entidadRepository.findOne as jest.Mock).mockResolvedValue(entidad);

      const resultado = await entidadesService.findById('123');
      expect(entidadRepository.findOne).toHaveBeenCalledWith({ where: { _id: '123' } });
      expect(resultado).toEqual(entidad);
    });

    it('debería retornar null si no se encuentra la entidad', async () => {
      (entidadRepository.findOne as jest.Mock).mockResolvedValue(null);

      const resultado = await entidadesService.findById('non-existent-id');
      expect(entidadRepository.findOne).toHaveBeenCalledWith({ where: { _id: 'non-existent-id' } });
      expect(resultado).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('debería eliminar una entidad por su ID', async () => {
      (entidadRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await entidadesService.deleteById('123');
      expect(entidadRepository.delete).toHaveBeenCalledWith({ _id: '123' });
    });
  });
});
