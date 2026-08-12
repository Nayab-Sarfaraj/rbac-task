import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRepository } from '../repositories/user.repository';
import { auditLogService } from './auditLog.service';
import { IUser } from '../models/user.model';
import {
  ConflictError,
  UnauthorizedError,
} from '../utils/errors';
import { UserPayload } from '../types/express';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(name: string, email: string, password: string): Promise<IUser> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({
      name,
      email,
      passwordHash,
      role: 'member',
      isDeleted: false,
    });

    // Write audit log
    await auditLogService.log(user._id.toString(), 'USER_CREATED', 'User', user._id.toString(), {
      email: user.email,
    });

    return user;
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findByEmail(email, true);
    if (!user || user.isDeleted) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const payload: UserPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    // Clean up password hash
    user.passwordHash = undefined as any;

    return { user, accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as UserPayload;
      const user = await this.userRepository.findById(decoded.id);

      if (!user || user.isDeleted) {
        throw new UnauthorizedError('User not found or deactivated');
      }

      const payload: UserPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }
}

export const authService = new AuthService();
