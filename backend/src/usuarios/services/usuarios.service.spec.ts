import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import { Usuario } from '../entities/usuario.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MongoRepository, UpdateResult, } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compareSync: jest.fn(),
  compare: jest.fn()
}));

const mockUsuario: Usuario = {
  id: new ObjectId('681c90981b1dcc4473074724'),
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashedPassword',
  nombre: 'Juan',
  apellido: 'Pérez',
  enabled: true,
};

describe('UsuariosService', () => {
  let service: UsuariosService;
  let repository: MongoRepository<Usuario>;
  let bcryptHash: jest.Mock;
  let bcryptCompare: jest.Mock;
  let bcryptCompareSync: jest.Mock;

  const mockRepository = {
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
    repository = module.get<MongoRepository<Usuario>>(getRepositoryToken(Usuario));
    bcryptHash = jest.mocked(bcrypt.hash) as jest.Mock;
    bcryptCompare = jest.mocked(bcrypt.compare) as jest.Mock;
    bcryptCompareSync = jest.mocked(bcrypt.compareSync) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const dto = { ...mockUsuario, password: '123456' };
      const hashed = await bcrypt.hash(dto.password, 10);
      mockRepository.save.mockResolvedValue({ ...mockUsuario, password: hashed });
      const result = await service.create(dto);
      expect(bcrypt.compareSync(dto.password, result.password));
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockUsuario], 1]);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toEqual([mockUsuario]);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should handle empty query', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
    it('should search users with q using Like', async () => {
      const q = 'admin';
      mockRepository.findAndCount.mockResolvedValue([[mockUsuario], 1]);
      const result = await service.findAll({ page: 1, limit: 10, q });
      expect(result.data).toEqual([mockUsuario]);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);

    });
  });

  describe('findOne', () => {
    it('should find one by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUsuario);
      const result = await service.findOne(mockUsuario.id.toString());
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { _id: new ObjectId(mockUsuario.id) },
      });
      expect(result).toEqual(mockUsuario);
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findOne(mockUsuario.id.toString());
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { _id: new ObjectId(mockUsuario.id) },
      });
      expect(result).toBeNull();
    });
  });

  describe('findOneByUsername', () => {
    it('should find user by username', async () => {
      mockRepository.findOne.mockResolvedValue(mockUsuario);
      const result = await service.findOneByUsername(mockUsuario.username);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { username: mockUsuario.username },
      });
      expect(result).toEqual(mockUsuario);
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findOneByUsername('nouser');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'nouser' },
      });
      expect(result).toBeNull();
    });

    it('should throw error if username is null or empty', async () => {
      await expect(service.findOneByUsername('')).rejects.toThrow('Username is required');
      await expect(service.findOneByUsername(null as any)).rejects.toThrow('Username is required');
    });

    it('should throw error if username is only whitespace', async () => {
      await expect(service.findOneByUsername('   ')).rejects.toThrow('Username is required');
    });
  });

  describe('findOneByEmail', () => {
    it('should find user by email', async () => {
      mockRepository.findOne.mockResolvedValue(mockUsuario);
      const result = await service.findOneByEmail(mockUsuario.email);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUsuario.email },
      });
      expect(result).toEqual(mockUsuario);
    });

    it('should return null if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findOneByEmail('nonexistent@example.com');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
      expect(result).toBeNull();
    });

    it('should throw error if email is null or empty', async () => {
      await expect(service.findOneByEmail('')).rejects.toThrow('Email is required');
      await expect(service.findOneByEmail(null as any)).rejects.toThrow('Email is required');
    });

    it('should throw error if email is only whitespace', async () => {
      await expect(service.findOneByEmail('   ')).rejects.toThrow('Email is required');
    });
  });

  
  describe('update', () => {
    it('should update a user and hash password if new password is provided and different', async () => {
      // Arrange
      const dto = { username: 'new', newPassword: 'newpass' };
      const hashed = 'hashednewpass';
      bcryptHash.mockResolvedValue(hashed);
      mockRepository.findOne.mockResolvedValue({ ...mockUsuario, password: 'oldHashedPass' });
      const updateResult: UpdateResult = { affected: 1, raw: {}, generatedMaps: [] };
      mockRepository.update.mockResolvedValue(updateResult);
      mockRepository.findOne.mockResolvedValue({
        ...mockUsuario,
        username: 'new',
        password: hashed,
      });

      // Act
      const [affected, updated] = await service.update(mockUsuario.id.toString(), dto);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { _id: new ObjectId(mockUsuario.id) } });
      expect(bcryptHash).toHaveBeenCalledWith('newpass', 10);
      expect(mockRepository.update);
      expect(affected).toBe(1);
      expect(updated[0].password).toBe(hashed);
    });

    it('should update a user without changing password if new password is same as old', async () => {
      // Arrange
      const dto = { username: 'new', password: 'hashedPassword' };
      mockRepository.findOne.mockResolvedValue(mockUsuario);
      const updateResult: UpdateResult = { affected: 1, raw: {}, generatedMaps: [] };  // Mock UpdateResult
      mockRepository.update.mockResolvedValue(updateResult);
      mockRepository.findOne.mockResolvedValue({ ...mockUsuario, username: 'new' });
      bcryptCompare.mockResolvedValue(true);
      // Act
      const [affected, updated] = await service.update(mockUsuario.id.toString(), dto);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { _id: new ObjectId(mockUsuario.id) } });
      expect(bcryptHash).not.toHaveBeenCalled();
      expect(mockRepository.update)
      expect(affected).toBe(1);
      expect(updated[0].password).toBe('hashedPassword');
    });

    it('should update a user without changing password if no new password is provided', async () => {
      // Arrange
      const dto = { username: 'new' };
      mockRepository.findOne.mockResolvedValue(mockUsuario);
      const updateResult: UpdateResult = { affected: 1, raw: {}, generatedMaps: [] };
      mockRepository.update.mockResolvedValue(updateResult);
      mockRepository.findOne.mockResolvedValue({ ...mockUsuario, username: 'new' });

      // Act
      const [affected, updated] = await service.update(mockUsuario.id.toString(), dto);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { _id: new ObjectId(mockUsuario.id) } });
      expect(bcryptHash).not.toHaveBeenCalled();
      expect(mockRepository.update);
      expect(affected).toBe(1);
      expect(updated[0].password).toBe('hashedPassword');
    });

    it('should throw if password is empty or whitespace', async () => {
      // Arrange
      const dto = { username: 'any', newPassword: '   ' };
      mockRepository.findOne.mockResolvedValue(mockUsuario);

      // Act & Assert
      await expect(service.update(mockUsuario.id.toString(), dto)).rejects.toThrow('Password cannot be empty');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should return 0 and empty array if no users affected', async () => {
      // Arrange
      const dto = { username: 'noupdate' };
      mockRepository.findOne.mockResolvedValue(mockUsuario);
      const updateResult: UpdateResult = { affected: 0, raw: {}, generatedMaps: [] };
      mockRepository.update.mockResolvedValue(updateResult);
      mockRepository.findOne.mockResolvedValue(null);

      // Act
      const [affected, updated] = await service.update(mockUsuario.id.toString(), dto);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { _id: new ObjectId(mockUsuario.id) } });
      expect(mockRepository.update);
      expect(affected).toBe(0);
      expect(updated).toEqual([]);
    });

    it('should handle user not found', async () => {
      // Arrange
      const dto = { username: 'newusername' };
      mockRepository.findOne.mockResolvedValue(null);

      // Act
      const [affected, updated] = await service.update(mockUsuario.id.toString(), dto);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { _id: new ObjectId(mockUsuario.id) } });
      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(affected).toBe(0);
      expect(updated).toEqual([]);
    });
  });
  
  describe('remove', () => {
    it('should remove user if exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUsuario);
      mockRepository.remove.mockResolvedValue(undefined);
      await expect(service.remove(mockUsuario.id.toString())).resolves.toBeUndefined();
    });

    it('should throw if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(mockUsuario.id.toString())).rejects.toThrow('User not found');
    });
  });
});
