import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service'; 
import { RegisterAuthDto } from '../dto/register-auth.dto';
import { LoginAuthDto } from '../dto/login-auth.dto';

const mockAuthService = {
  login: jest.fn().mockImplementation((user) => ({ access_token: 'jwt_token', user })),
  register: jest.fn().mockImplementation((dto) => ({ id: 1, ...dto })),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  describe('login', () => {
    it('should return access_token and user', async () => {
      const user: LoginAuthDto = { username: 'testuser', password: 'password' };
      const result = await controller.login(user);
      expect(result).toEqual({ access_token: 'jwt_token', user });
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto: RegisterAuthDto = { username: 'testuser', password: '123456',nombre:'test',apellido:"testApellido",email:'noreply@.com' };
      const result = await controller.register(dto);
      expect(result).toEqual({ id: 1, ...dto });
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('protectedRoute', () => {
    it('should return protected message and user', async () => {
      const user = { id: 1, username: 'protectedUser' };
      const result = await controller.protectedRoute({ user });
      expect(result).toEqual({
        message: 'Esta ruta está protegida y solo accesible con un token JWT válido.',
        user,
      });
    });
  });
});
