import * as fc from 'fast-check';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AuthService } from './auth.service';
import { UserSchema } from '../users/user.schema';
import { SignupDto } from '../users/dto/signup.dto';
import { SigninDto } from '../users/dto/signin.dto';

describe('Auth Service - Integration Property Tests', () => {
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
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await module.close();
    await mongod.stop();
  });

  // Feature: easygenerator-auth-system, Property 2: Duplicate Email Registration Fails
  describe('Property 2: Duplicate Email Registration Fails', () => {
    it(
      'should return 409 Conflict when attempting to register with existing email',
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
              // Create first user
              const signupDto1: SignupDto = {
                email: userData.email,
                name: userData.name,
                password: userData.password,
              };

              await authService.signup(signupDto1);

              // Attempt to create duplicate user with same email
              const signupDto2: SignupDto = {
                email: userData.email,
                name: 'Different Name',
                password: 'DifferentPass123!',
              };

              // Verify 409 Conflict is thrown
              await expect(authService.signup(signupDto2)).rejects.toThrow(
                'Email already exists',
              );
            },
          ),
          { numRuns: 100 },
        );
      },
      30000,
    );
  });

  // Feature: easygenerator-auth-system, Property 6: Invalid Credentials Rejected
  describe('Property 6: Invalid Credentials Rejected', () => {
    it(
      'should return 401 Unauthorized for wrong passwords and non-existent emails',
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
            fc.string({ minLength: 8, maxLength: 20 }).filter(
              (pwd) =>
                /[A-Za-z]/.test(pwd) &&
                /\d/.test(pwd) &&
                /[@$!%*#?&]/.test(pwd),
            ),
            fc.emailAddress(),
            async (userData, wrongPassword, nonExistentEmail) => {
              // Create user
              const signupDto: SignupDto = {
                email: userData.email,
                name: userData.name,
                password: userData.password,
              };

              await authService.signup(signupDto);

              // Test 1: Wrong password for existing user
              if (wrongPassword !== userData.password) {
                const signinDtoWrongPassword: SigninDto = {
                  email: userData.email,
                  password: wrongPassword,
                };

                await expect(
                  authService.signin(signinDtoWrongPassword),
                ).rejects.toThrow('Invalid credentials');
              }

              // Test 2: Non-existent email
              if (nonExistentEmail !== userData.email) {
                const signinDtoNonExistent: SigninDto = {
                  email: nonExistentEmail,
                  password: userData.password,
                };

                await expect(
                  authService.signin(signinDtoNonExistent),
                ).rejects.toThrow('Invalid credentials');
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
