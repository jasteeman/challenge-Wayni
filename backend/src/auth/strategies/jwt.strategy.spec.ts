 
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UsuariosService } from 'src/usuarios/services/usuarios.service';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let mockConfigService: Partial<ConfigService>;
  let mockUsersService: Partial<UsuariosService>;
  const mockJwtSecret = 'testSecret';
  const mockUser = { id: 1, username: 'testuser' };

  beforeEach(() => {
    mockConfigService = {
      getOrThrow: jest.fn().mockReturnValue(mockJwtSecret),
    };
    mockUsersService = {
      findOne: jest.fn(),
      findOneByUsername: jest.fn(),
    };
    jwtStrategy = new JwtStrategy(
      mockConfigService as ConfigService,
      mockUsersService as UsuariosService,
    );
  });

  describe('validate', () => {
    it('should call usersService.findOneByUsername with the sub from the payload', async () => {
      const payload = { username: 'testuser' };
      (mockUsersService.findOneByUsername as jest.Mock).mockResolvedValue(mockUser);
      await jwtStrategy.validate(payload);
      expect(mockUsersService.findOneByUsername).toHaveBeenCalledWith(payload.username);
    });

    it('should return the user if found', async () => {
      const payload = { username: 'testuser' };
      (mockUsersService.findOneByUsername as jest.Mock).mockResolvedValue(mockUser);
      const user = await jwtStrategy.validate(payload);
      expect(user).toEqual(mockUser);
    });

    it('should return null if the user is not found', async () => {
      const payload = { username: 'nonexistentuser' };
      (mockUsersService.findOneByUsername as jest.Mock).mockResolvedValue(undefined);
      const user = await jwtStrategy.validate(payload);
      expect(user).toBeNull();
    });

    it('should handle errors from usersService.findOneByUsername', async () => {
      const errorMessage = 'Database error';
      const payload = { username: 'testuser' };
      (mockUsersService.findOneByUsername as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
      await expect(jwtStrategy.validate(payload)).rejects.toThrow(errorMessage);
    });
  });
});