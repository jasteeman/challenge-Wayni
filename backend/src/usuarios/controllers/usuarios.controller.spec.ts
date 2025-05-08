import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from '../services/usuarios.service';
import { CreateUsuarioDto, UpdateUsuarioDto } from '../dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

describe('UsuariosController', () => {
  let controller: UsuariosController;
  let service: UsuariosService;

  const mockUsuario = {
    id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@test.com',
    password: 'hashedpassword',
    apellido: 'testApe',
    nombre: 'name'
  };

  const mockUsuariosService = {
    create: jest.fn().mockResolvedValue(mockUsuario),
    findAll: jest.fn().mockResolvedValue({ rows: [mockUsuario], count: 1 }),
    findOne: jest.fn().mockResolvedValue(mockUsuario),
    update: jest.fn().mockResolvedValue([1, [mockUsuario]]),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        {
          provide: UsuariosService,
          useValue: mockUsuariosService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsuariosController>(UsuariosController);
    service = module.get<UsuariosService>(UsuariosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto: CreateUsuarioDto = {
        username: 'testuser',
        email: 'test@test.com',
        password: '1234',
        apellido:'testApe',
        nombre:'name'
      };
      const result = await controller.create(dto);
      expect(result).toEqual(mockUsuario);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await controller.findAll();
      expect(result).toEqual({ rows: [mockUsuario], count: 1 });
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const result = await controller.findOne('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockUsuario);
      expect(service.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const dto: UpdateUsuarioDto = { username: 'updated' };
      const result = await controller.update('1', dto);
      expect(result).toEqual([1, [mockUsuario]]);
      expect(service.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const result = await controller.remove('1');
      expect(result).toEqual({ message: 'Usuario con ID 1 eliminado' });
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
