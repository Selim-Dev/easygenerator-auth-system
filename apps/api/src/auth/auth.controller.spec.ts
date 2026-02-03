import * as fc from 'fast-check';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserSchema } from '../users/user.schema';
import { SignupDto } from '../users/dto/signup.dto';

describe('Auth Controller - Property Tests', () => {
  let app: INestApplication;
  let authService: AuthService;
  let mongod: MongoMemoryServer;
  let module: TestingModule;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        JwtModule.register({
          secret: 'test-secret-key-for-property-testing',
          signOptions: { expiresIn: '24h' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtStrategy,
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
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );
    await app.init();

    authService = module.get<AuthService>(AuthService);
  }, 180000);

  afterAll(async () => {
    await app.close();
    await module.close();
    await mongod.stop();
  });

  // Feature: easygenerator-auth-system, Property 8: Valid Token Grants Access
  describe('Property 8: Valid Token Grants Access', () => {
    it(
      'should return user information when valid JWT token is provided',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.record({
              email: fc.emailAddress(),
              name: fc.string({ minLength: 3, maxLength: 50 }),
              password: fc
                .string({ minLength: 8, maxLength: 20 })
                .filter(
                  (pwd) =>
                    /[A-Za-z]/.test(pwd) &&
                    /\d/.test(pwd) &&
                    /[@$!%*#?&]/.test(pwd),
                ),
            }),
            async (userData) => {
              // Create user
              const signupDto: SignupDto = {
                email: userData.email,
                name: userData.name,
                password: userData.password,
              };

              const user = await authService.signup(signupDto);

              // Sign in to get token
              const signinResponse = await authService.signin({
                email: userData.email,
                password: userData.password,
              });

              const token = signinResponse.access_token;

              // Call /me endpoint with valid token
              const response = await request(app.getHttpServer())
                .get('/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

              // Verify correct user data is returned
              expect(response.body).toEqual({
                id: user.id,
                email: user.email,
                name: user.name,
              });
            },
          ),
          { numRuns: 100 },
        );
      },
      30000,
    );
  });

  // Feature: easygenerator-auth-system, Property 9: Invalid Token Denied Access
  describe('Property 9: Invalid Token Denied Access', () => {
    it(
      'should return 401 Unauthorized for invalid, expired, or missing tokens',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.oneof(
              fc.constant(''), // Missing token
              fc.constant('invalid-token'), // Invalid token
              fc.constant('Bearer invalid-token'), // Invalid Bearer token
              fc.string({ minLength: 10, maxLength: 50 }), // Random string
            ),
            async (invalidToken) => {
              // Test 1: Missing token (no Authorization header)
              await request(app.getHttpServer())
                .get('/auth/me')
                .expect(401);

              // Test 2: Invalid token
              if (invalidToken && invalidToken !== '') {
                await request(app.getHttpServer())
                  .get('/auth/me')
                  .set('Authorization', invalidToken.startsWith('Bearer ') ? invalidToken : `Bearer ${invalidToken}`)
                  .expect(401);
              }
            },
          ),
          { numRuns: 100 },
        );
      },
      30000,
    );
  });
});
