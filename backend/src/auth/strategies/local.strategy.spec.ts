import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../services/auth.service';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let mockAuthService: Partial<AuthService>;

  beforeEach(() => {
    mockAuthService = {
      validateUser: jest.fn(), // Inicializamos como una función mock vacía
    };
    localStrategy = new LocalStrategy(mockAuthService as AuthService);
  });

  it('should be defined', () => {
    expect(localStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should call authService.validateUser with the provided username and password', async () => {
      const username = 'testuser';
      const password = 'password';
      (mockAuthService.validateUser as jest.Mock).mockResolvedValue({id:1, username: 'testuser'});
      await localStrategy.validate(username, password);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(username, password);
    });

    it('should return the user if validateUser returns a user', async () => {
        const username = 'testuser';
        const password = 'password';
        const mockUser = { id: 1, username: 'testuser' };
        (mockAuthService.validateUser as jest.Mock).mockResolvedValue(mockUser);
        const user = await localStrategy.validate(username, password);
        expect(user).toEqual(mockUser);
      });

    it('should throw an UnauthorizedException if validateUser returns null', async () => {
      const username = 'testuser';
      const password = 'password';
      (mockAuthService.validateUser as jest.Mock).mockResolvedValue(null);
      await expect(localStrategy.validate(username, password)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle errors from authService.validateUser', async () => {
      const username = 'testuser';
      const password = 'password';
      const errorMessage = 'Authentication error';
      (mockAuthService.validateUser as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
      await expect(localStrategy.validate(username, password)).rejects.toThrow(errorMessage);
    });
  });
});