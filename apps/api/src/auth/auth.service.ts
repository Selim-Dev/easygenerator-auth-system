import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate JWT token with user ID in payload
   * @param userId - User's MongoDB _id as string
   * @returns JWT token string
   */
  generateToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload);
  }

  /**
   * Verify and decode JWT token
   * @param token - JWT token string
   * @returns Decoded payload with user ID
   */
  verifyToken(token: string): { sub: string } {
    return this.jwtService.verify(token);
  }
}
