import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

describe('Auth Service - Unit Tests', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test-secret';
              if (key === 'JWT_EXPIRATION') return '24h';
              return null;
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a token with user ID in payload', () => {
      const userId = '507f1f77bcf86cd799439011';
      const expectedToken = 'mock.jwt.token';

      jest.spyOn(jwtService, 'sign').mockReturnValue(expectedToken);

      const result = authService.generateToken(userId);

      expect(jwtService.sign).toHaveBeenCalledWith({ sub: userId });
      expect(result).toBe(expectedToken);
    });

    it('should generate different tokens for different user IDs', () => {
      const userId1 = '507f1f77bcf86cd799439011';
      const userId2 = '507f1f77bcf86cd799439012';
      const token1 = 'token1';
      const token2 = 'token2';

      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce(token1)
        .mockReturnValueOnce(token2);

      const result1 = authService.generateToken(userId1);
      const result2 = authService.generateToken(userId2);

      expect(result1).toBe(token1);
      expect(result2).toBe(token2);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = 'valid.jwt.token';
      const userId = '507f1f77bcf86cd799439011';
      const decodedPayload = { sub: userId };

      jest.spyOn(jwtService, 'verify').mockReturnValue(decodedPayload);

      const result = authService.verifyToken(token);

      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(result).toEqual(decodedPayload);
      expect(result.sub).toBe(userId);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => {
        authService.verifyToken(invalidToken);
      }).toThrow('Invalid token');
    });

    it('should throw error for expired token', () => {
      const expiredToken = 'expired.jwt.token';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('jwt expired');
      });

      expect(() => {
        authService.verifyToken(expiredToken);
      }).toThrow('jwt expired');
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'malformed';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      expect(() => {
        authService.verifyToken(malformedToken);
      }).toThrow('jwt malformed');
    });
  });
});
