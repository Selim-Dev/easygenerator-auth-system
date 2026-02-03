import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import * as fc from 'fast-check';
import * as bcrypt from 'bcrypt';
import { UserSchema } from './user.schema';
import { IUser } from './user.interface';

describe('User Schema Property Tests', () => {
  let mongod: MongoMemoryServer;
  let userModel: Model<IUser>;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
      ],
    }).compile();

    userModel = moduleRef.get<Model<IUser>>(getModelToken('User'));
  });

  afterAll(async () => {
    await moduleRef.close();
    await mongod.stop();
  });

  afterEach(async () => {
    await userModel.deleteMany({});
  });

  // Feature: easygenerator-auth-system, Property 1: Valid Registration Creates Account
  describe('Property 1: Valid Registration Creates Account', () => {
    it('should create account for any valid user data with hashed password', async () => {
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
            // Hash the password before storing (simulating what the auth service will do)
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Create user with hashed password
            const user = new userModel({
              email: userData.email,
              name: userData.name,
              password: hashedPassword,
            });

            const savedUser = await user.save();

            // Verify account was created
            expect(savedUser).toBeDefined();
            expect(savedUser.email).toBe(userData.email.toLowerCase());
            expect(savedUser.name).toBe(userData.name);
            expect(savedUser.password).not.toBe(userData.password);

            // Verify password is hashed with bcrypt
            expect(savedUser.password).toMatch(/^\$2[aby]\$/);

            // Verify the hashed password can be verified
            const isPasswordValid = await bcrypt.compare(
              userData.password,
              savedUser.password,
            );
            expect(isPasswordValid).toBe(true);

            // Verify timestamps are set
            expect(savedUser.createdAt).toBeDefined();
            expect(savedUser.updatedAt).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    }, 60000); // Increase timeout for property test
  });
});
