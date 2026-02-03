import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { SignupDto } from '../users/dto/signup.dto';
import { SigninDto } from '../users/dto/signin.dto';
import * as passwordUtil from '../common/utils/password.util';

describe('AuthService - Unit Tests', () => {
  let authService: AuthService;
  let mockUserModel: any;

  beforeEach(async () => {
    const mockSave = jest.fn();
    
    // Mock User Model as a constructor function
    mockUserModel = jest.fn().mockImplementation((userData: any) => ({
      ...userData,
      _id: '507f1f77bcf86cd799439011',
      save: mockSave,
    }));
    
    // Add static methods to the mock
    mockUserModel.findOne = jest.fn();
    mockUserModel.findById = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret-key',
          signOptions: { expiresIn: '24h' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test-secret-key';
              if (key === 'JWT_EXPIRATION') return '24h';
              return null;
            }),
          },
        },
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const signupDto: SignupDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
      };

      mockUserModel.findOne.mockResolvedValue(null);

      const mockSavedUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
      };

      // Mock the save method to return the saved user
      mockUserModel.mockImplementationOnce((userData: any) => ({
        ...userData,
        _id: '507f1f77bcf86cd799439011',
        save: jest.fn().mockResolvedValue(mockSavedUser),
      }));

      jest.spyOn(passwordUtil, 'hashPassword').mockResolvedValue('hashedPassword');

      const result = await authService.signup(signupDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(passwordUtil.hashPassword).toHaveBeenCalledWith('Password123!');
      expect(result).toEqual({
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      const signupDto: SignupDto = {
        email: 'existing@example.com',
        name: 'Test User',
        password: 'Password123!',
      };

      mockUserModel.findOne.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'hashedPassword',
      });

      await expect(authService.signup(signupDto)).rejects.toThrow(ConflictException);
      await expect(authService.signup(signupDto)).rejects.toThrow('Email already exists');
    });
  });

  describe('signin', () => {
    it('should return JWT token for valid credentials', async () => {
      const signinDto: SigninDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      jest.spyOn(passwordUtil, 'verifyPassword').mockResolvedValue(true);

      const result = await authService.signin(signinDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(passwordUtil.verifyPassword).toHaveBeenCalledWith('Password123!', 'hashedPassword');
      expect(result).toHaveProperty('access_token');
      expect(typeof result.access_token).toBe('string');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const signinDto: SigninDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      mockUserModel.findOne.mockResolvedValue(null);

      await expect(authService.signin(signinDto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.signin(signinDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const signinDto: SigninDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      jest.spyOn(passwordUtil, 'verifyPassword').mockResolvedValue(false);

      await expect(authService.signin(signinDto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.signin(signinDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('validateUser', () => {
    it('should return user data for valid user ID', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
      };

      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await authService.validateUser(userId);

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';

      mockUserModel.findById.mockResolvedValue(null);

      await expect(authService.validateUser(userId)).rejects.toThrow(UnauthorizedException);
      await expect(authService.validateUser(userId)).rejects.toThrow('User not found');
    });
  });
});
