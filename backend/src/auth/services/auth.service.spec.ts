import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from 'src/usuarios/services/usuarios.service';
import * as bcrypt from 'bcryptjs';
import { RegisterAuthDto } from '../dto/register-auth.dto';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usuariosService: UsuariosService;
  const user = {
    id: 1,
    username: 'test',
    password: 'hashedPass',
    email: 'test@test.com',
    nombre: 'Nombre',
    apellido: 'Apellido',
    enabled: true,
  } as unknown as Usuario;

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUsuariosService = {
    findOneByUsername: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsuariosService, useValue: mockUsuariosService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usuariosService = module.get<UsuariosService>(UsuariosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data without password if password matches', async () => {
      jest.spyOn(usuariosService, 'findOneByUsername').mockResolvedValue(user);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test', '1234');

      expect(result).toEqual({
        id: 1,
        username: 'test',
        email: 'test@test.com',
        nombre: 'Nombre',
        apellido: 'Apellido',
        enabled: true,
      });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(usuariosService, 'findOneByUsername').mockResolvedValue(null);

      const result = await service.validateUser('test', '1234');
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      jest.spyOn(usuariosService, 'findOneByUsername').mockResolvedValue(user);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token', async () => {
      const user = { id: 1, username: 'test' };
      mockJwtService.sign.mockReturnValue('fake-token');

      const result = await service.login(user);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        username: user.username,
      });
      expect(result).toEqual({ access_token: 'fake-token' });
    });
  });

  describe('register', () => {
    it('should call usuariosService.create with registerAuthDto', async () => {
      const dto: RegisterAuthDto = {
        username: 'newuser',
        password: '1234',
        email: 'newuser@test.com',
      } as RegisterAuthDto;

      const createdUser = { id: 1, ...dto };
      mockUsuariosService.create.mockResolvedValue(createdUser);

      const result = await service.register(dto);

      expect(mockUsuariosService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdUser);
    });
  });
});
