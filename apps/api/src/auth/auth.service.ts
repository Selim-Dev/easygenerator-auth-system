import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from '../users/user.interface';
import { SignupDto } from '../users/dto/signup.dto';
import { SigninDto } from '../users/dto/signin.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { hashPassword, verifyPassword } from '../common/utils/password.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel('User') private readonly userModel: Model<IUser>,
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

  /**
   * Register a new user
   * @param dto - Signup data containing email, name, and password
   * @returns UserResponseDto without password
   * @throws ConflictException if email already exists
   */
  async signup(dto: SignupDto): Promise<UserResponseDto> {
    // Check if email already exists
    const existingUser = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password with bcrypt
    const hashedPassword = await hashPassword(dto.password);

    // Create and save user to MongoDB
    const user = new this.userModel({
      email: dto.email.toLowerCase(),
      name: dto.name,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    // Return UserResponseDto (without password)
    return {
      id: savedUser._id.toString(),
      email: savedUser.email,
      name: savedUser.name,
    };
  }

  /**
   * Authenticate user and return JWT token
   * @param dto - Signin data containing email and password
   * @returns Object with access_token (JWT)
   * @throws UnauthorizedException if credentials are invalid
   */
  async signin(dto: SigninDto): Promise<{ access_token: string }> {
    // Find user by email
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    
    // Return 401 if user not found
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password with bcrypt
    const isPasswordValid = await verifyPassword(dto.password, user.password);
    
    // Return 401 if password incorrect
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate and return JWT token
    const token = this.generateToken(user._id.toString());
    return { access_token: token };
  }

  /**
   * Validate user by ID from JWT payload
   * @param userId - User's MongoDB _id as string
   * @returns UserResponseDto without password
   * @throws UnauthorizedException if user not found
   */
  async validateUser(userId: string): Promise<UserResponseDto> {
    // Find user by ID from JWT payload
    const user = await this.userModel.findById(userId);
    
    // Handle user not found
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return UserResponseDto
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };
  }
}
