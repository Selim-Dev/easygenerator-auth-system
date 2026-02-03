import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as fc from 'fast-check';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from './app.module';

describe('Property 25: Swagger Documentation Available', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          if (key === 'MONGODB_URI') return uri;
          if (key === 'JWT_SECRET') return 'test-secret-key';
          if (key === 'JWT_EXPIRATION') return '24h';
          if (key === 'CORS_ORIGIN') return 'http://localhost:5173';
          return null;
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();

    // Configure Swagger exactly as in main.ts
    const config = new DocumentBuilder()
      .setTitle('Easygenerator Authentication API')
      .setDescription('Authentication system API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  });

  // Feature: easygenerator-auth-system, Property 25: Swagger Documentation Available
  it('should expose Swagger documentation at /api-docs', async () => {
    const response = await request(app.getHttpServer())
      .get('/api-docs/')
      .expect(200);

    expect(response.text).toContain('Swagger UI');
  });

  // Feature: easygenerator-auth-system, Property 25: Swagger Documentation Available
  it('should have complete API documentation with all endpoints', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        const response = await request(app.getHttpServer())
          .get('/api-docs-json')
          .expect(200);

        const swaggerDoc = response.body;

        // Verify basic structure
        expect(swaggerDoc).toHaveProperty('openapi');
        expect(swaggerDoc).toHaveProperty('info');
        expect(swaggerDoc).toHaveProperty('paths');
        expect(swaggerDoc).toHaveProperty('components');

        // Verify API metadata
        expect(swaggerDoc.info.title).toBe('Easygenerator Authentication API');
        expect(swaggerDoc.info.description).toBe('Authentication system API documentation');
        expect(swaggerDoc.info.version).toBe('1.0');

        // Verify bearer auth is configured
        expect(swaggerDoc.components.securitySchemes).toHaveProperty('bearer');
        expect(swaggerDoc.components.securitySchemes.bearer.type).toBe('http');
        expect(swaggerDoc.components.securitySchemes.bearer.scheme).toBe('bearer');

        // Verify all required endpoints are documented
        const paths = swaggerDoc.paths;
        expect(paths).toHaveProperty('/auth/signup');
        expect(paths).toHaveProperty('/auth/signin');
        expect(paths).toHaveProperty('/auth/me');

        // Verify /auth/signup endpoint
        const signupEndpoint = paths['/auth/signup'];
        expect(signupEndpoint).toHaveProperty('post');
        expect(signupEndpoint.post.summary).toBe('Register new user');
        expect(signupEndpoint.post.tags).toContain('Authentication');
        expect(signupEndpoint.post.requestBody).toBeDefined();
        expect(signupEndpoint.post.responses).toHaveProperty('201');
        expect(signupEndpoint.post.responses).toHaveProperty('409');
        expect(signupEndpoint.post.responses).toHaveProperty('400');

        // Verify signup request schema
        const signupSchema = signupEndpoint.post.requestBody.content['application/json'].schema;
        expect(signupSchema.$ref).toContain('SignupDto');

        // Verify /auth/signin endpoint
        const signinEndpoint = paths['/auth/signin'];
        expect(signinEndpoint).toHaveProperty('post');
        expect(signinEndpoint.post.summary).toBe('Sign in user');
        expect(signinEndpoint.post.tags).toContain('Authentication');
        expect(signinEndpoint.post.requestBody).toBeDefined();
        expect(signinEndpoint.post.responses).toHaveProperty('200');
        expect(signinEndpoint.post.responses).toHaveProperty('401');
        expect(signinEndpoint.post.responses).toHaveProperty('400');

        // Verify signin request schema
        const signinSchema = signinEndpoint.post.requestBody.content['application/json'].schema;
        expect(signinSchema.$ref).toContain('SigninDto');

        // Verify /auth/me endpoint
        const meEndpoint = paths['/auth/me'];
        expect(meEndpoint).toHaveProperty('get');
        expect(meEndpoint.get.summary).toBe('Get current user');
        expect(meEndpoint.get.tags).toContain('Authentication');
        expect(meEndpoint.get.responses).toHaveProperty('200');
        expect(meEndpoint.get.responses).toHaveProperty('401');

        // Verify /auth/me requires authentication
        expect(meEndpoint.get.security).toBeDefined();
        expect(meEndpoint.get.security).toEqual(
          expect.arrayContaining([expect.objectContaining({ bearer: [] })]),
        );

        // Verify schemas are defined
        const schemas = swaggerDoc.components.schemas;
        expect(schemas).toHaveProperty('SignupDto');
        expect(schemas).toHaveProperty('SigninDto');
        expect(schemas).toHaveProperty('UserResponseDto');

        // Verify SignupDto schema
        const signupDtoSchema = schemas.SignupDto;
        expect(signupDtoSchema.required).toContain('email');
        expect(signupDtoSchema.required).toContain('name');
        expect(signupDtoSchema.required).toContain('password');
        expect(signupDtoSchema.properties).toHaveProperty('email');
        expect(signupDtoSchema.properties).toHaveProperty('name');
        expect(signupDtoSchema.properties).toHaveProperty('password');

        // Verify SigninDto schema
        const signinDtoSchema = schemas.SigninDto;
        expect(signinDtoSchema.required).toContain('email');
        expect(signinDtoSchema.required).toContain('password');
        expect(signinDtoSchema.properties).toHaveProperty('email');
        expect(signinDtoSchema.properties).toHaveProperty('password');

        // Verify UserResponseDto schema
        const userResponseSchema = schemas.UserResponseDto;
        expect(userResponseSchema.required).toContain('id');
        expect(userResponseSchema.required).toContain('email');
        expect(userResponseSchema.required).toContain('name');
        expect(userResponseSchema.properties).toHaveProperty('id');
        expect(userResponseSchema.properties).toHaveProperty('email');
        expect(userResponseSchema.properties).toHaveProperty('name');
      }),
      { numRuns: 100 },
    );
  });
});
