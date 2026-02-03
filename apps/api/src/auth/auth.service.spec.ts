import * as fc from 'fast-check';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { AuthService } from './auth.service';

describe('Auth Service - Property Tests', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let mockUserModel: any;

  beforeEach(async () => {
    // Mock User Model
    mockUserModel = jest.fn().mockImplementation((userData: any) => ({
      ...userData,
      _id: '507f1f77bcf86cd799439011',
      save: jest.fn(),
    }));
    mockUserModel.findOne = jest.fn();
    mockUserModel.findById = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret-key-for-property-testing',
          signOptions: { expiresIn: '24h' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test-secret-key-for-property-testing';
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
    jwtService = module.get<JwtService>(JwtService);
  });

  // Feature: easygenerator-auth-system, Property 5: Valid Credentials Return JWT
  describe('Property 5: Valid Credentials Return JWT', () => {
    it(
      'should generate JWT token containing user ID for any valid user ID',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.string({ minLength: 24, maxLength: 24 }), // MongoDB ObjectId length
            async (userId) => {
              // Generate token
              const token = authService.generateToken(userId);

              // Verify token is a string
              expect(typeof token).toBe('string');
              expect(token.length).toBeGreaterThan(0);

              // Verify token contains three parts (header.payload.signature)
              const parts = token.split('.');
              expect(parts.length).toBe(3);

              // Verify token payload contains user ID
              const decoded = authService.verifyToken(token);
              expect(decoded.sub).toBe(userId);
            },
          ),
          { numRuns: 100 },
        );
      },
      10000,
    );
  });

  // Feature: easygenerator-auth-system, Property 10: Token Signature Integrity
  describe('Property 10: Token Signature Integrity', () => {
    it(
      'should reject tampered tokens for any valid user ID',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.string({ minLength: 24, maxLength: 24 }), // MongoDB ObjectId length
            fc.integer({ min: 0, max: 2 }), // Which part to tamper (0=header, 1=payload, 2=signature)
            async (userId, partToTamper) => {
              // Generate valid token
              const validToken = authService.generateToken(userId);

              // Tamper with the token
              const parts = validToken.split('.');
              parts[partToTamper] = parts[partToTamper] + 'tampered';
              const tamperedToken = parts.join('.');

              // Verify that tampered token is rejected
              expect(() => {
                authService.verifyToken(tamperedToken);
              }).toThrow();
            },
          ),
          { numRuns: 100 },
        );
      },
      10000,
    );
  });
});
