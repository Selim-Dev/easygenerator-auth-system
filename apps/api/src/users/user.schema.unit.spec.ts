import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { UserSchema } from './user.schema';
import { IUser } from './user.interface';

describe('User Schema Unit Tests', () => {
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

  describe('Email uniqueness constraint', () => {
    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword123',
      };

      // Create first user
      const user1 = new userModel(userData);
      await user1.save();

      // Attempt to create second user with same email
      const user2 = new userModel(userData);

      await expect(user2.save()).rejects.toThrow();
    });

    it('should allow different emails', async () => {
      const user1 = new userModel({
        email: 'user1@example.com',
        name: 'User One',
        password: 'hashedpassword123',
      });
      await user1.save();

      const user2 = new userModel({
        email: 'user2@example.com',
        name: 'User Two',
        password: 'hashedpassword456',
      });
      await user2.save();

      const users = await userModel.find({});
      expect(users).toHaveLength(2);
    });

    it('should store email in lowercase', async () => {
      const user = new userModel({
        email: 'Test@Example.COM',
        name: 'Test User',
        password: 'hashedpassword123',
      });
      const savedUser = await user.save();

      expect(savedUser.email).toBe('test@example.com');
    });
  });

  describe('Required fields', () => {
    it('should require email field', async () => {
      const user = new userModel({
        name: 'Test User',
        password: 'hashedpassword123',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require name field', async () => {
      const user = new userModel({
        email: 'test@example.com',
        password: 'hashedpassword123',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require password field', async () => {
      const user = new userModel({
        email: 'test@example.com',
        name: 'Test User',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should save successfully with all required fields', async () => {
      const user = new userModel({
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword123',
      });

      const savedUser = await user.save();
      expect(savedUser).toBeDefined();
      expect(savedUser.email).toBe('test@example.com');
      expect(savedUser.name).toBe('Test User');
      expect(savedUser.password).toBe('hashedpassword123');
    });
  });

  describe('Schema defaults and timestamps', () => {
    it('should automatically set createdAt timestamp', async () => {
      const user = new userModel({
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword123',
      });

      const savedUser = await user.save();
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.createdAt).toBeInstanceOf(Date);
    });

    it('should automatically set updatedAt timestamp', async () => {
      const user = new userModel({
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword123',
      });

      const savedUser = await user.save();
      expect(savedUser.updatedAt).toBeDefined();
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt timestamp on modification', async () => {
      const user = new userModel({
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword123',
      });

      const savedUser = await user.save();
      const originalUpdatedAt = savedUser.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      savedUser.name = 'Updated Name';
      await savedUser.save();

      expect(savedUser.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
    });

    it('should validate name minimum length', async () => {
      const user = new userModel({
        email: 'test@example.com',
        name: 'AB', // Less than 3 characters
        password: 'hashedpassword123',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should accept name with exactly 3 characters', async () => {
      const user = new userModel({
        email: 'test@example.com',
        name: 'ABC',
        password: 'hashedpassword123',
      });

      const savedUser = await user.save();
      expect(savedUser.name).toBe('ABC');
    });
  });
});
