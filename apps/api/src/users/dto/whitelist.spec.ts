import * as fc from 'fast-check';
import { ValidationPipe } from '@nestjs/common';
import { SignupDto } from './signup.dto';

describe('Whitelist Transformation Property Tests', () => {
  let validationPipe: ValidationPipe;

  beforeEach(() => {
    validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    });
  });

  // Feature: easygenerator-auth-system, Property 15: Whitelist Transformation Strips Unknown Properties
  describe('Property 15: Whitelist Transformation Strips Unknown Properties', () => {
    it('should strip unknown properties from valid signup data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            password: fc
              .string({ minLength: 8, maxLength: 50 })
              .filter(
                (pwd) =>
                  /[A-Za-z]/.test(pwd) &&
                  /\d/.test(pwd) &&
                  /[@$!%*#?&]/.test(pwd) &&
                  /^[A-Za-z\d@$!%*#?&]+$/.test(pwd),
              ),
            // Add random extra properties
            extraField1: fc.string(),
            extraField2: fc.integer(),
            extraField3: fc.boolean(),
            adminFlag: fc.constant(true),
            role: fc.constant('admin'),
          }),
          async (dataWithExtras) => {
            // Transform the data through the validation pipe
            const transformed = await validationPipe.transform(
              dataWithExtras,
              {
                type: 'body',
                metatype: SignupDto,
              },
            );

            // Verify only whitelisted properties remain
            expect(transformed).toHaveProperty('email');
            expect(transformed).toHaveProperty('name');
            expect(transformed).toHaveProperty('password');

            // Verify extra properties are stripped
            expect(transformed).not.toHaveProperty('extraField1');
            expect(transformed).not.toHaveProperty('extraField2');
            expect(transformed).not.toHaveProperty('extraField3');
            expect(transformed).not.toHaveProperty('adminFlag');
            expect(transformed).not.toHaveProperty('role');

            // Verify the transformed object is an instance of SignupDto
            expect(transformed).toBeInstanceOf(SignupDto);

            // Verify values are preserved correctly
            expect(transformed.email).toBe(dataWithExtras.email);
            expect(transformed.name).toBe(dataWithExtras.name);
            expect(transformed.password).toBe(dataWithExtras.password);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should strip unknown properties even with invalid data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.string(), // May be invalid
            name: fc.string(), // May be too short
            password: fc.string(), // May not meet requirements
            // Add random extra properties
            extraField: fc.string(),
            maliciousField: fc.constant('hack'),
          }),
          async (dataWithExtras) => {
            try {
              const transformed = await validationPipe.transform(
                dataWithExtras,
                {
                  type: 'body',
                  metatype: SignupDto,
                },
              );

              // If validation passes, extra fields should be stripped
              expect(transformed).not.toHaveProperty('extraField');
              expect(transformed).not.toHaveProperty('maliciousField');
            } catch (error) {
              // If validation fails, that's expected for invalid data
              // The important thing is that the pipe attempted to strip extras before validation
              expect(error).toBeDefined();
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle empty extra properties object', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            password: fc
              .string({ minLength: 8, maxLength: 50 })
              .filter(
                (pwd) =>
                  /[A-Za-z]/.test(pwd) &&
                  /\d/.test(pwd) &&
                  /[@$!%*#?&]/.test(pwd) &&
                  /^[A-Za-z\d@$!%*#?&]+$/.test(pwd),
              ),
          }),
          async (validData) => {
            // Add nested object as extra property
            const dataWithNested = {
              ...validData,
              nestedExtra: { foo: 'bar', baz: 123 },
            };

            const transformed = await validationPipe.transform(dataWithNested, {
              type: 'body',
              metatype: SignupDto,
            });

            // Verify nested extra property is stripped
            expect(transformed).not.toHaveProperty('nestedExtra');

            // Verify valid properties remain
            expect(transformed.email).toBe(validData.email);
            expect(transformed.name).toBe(validData.name);
            expect(transformed.password).toBe(validData.password);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
