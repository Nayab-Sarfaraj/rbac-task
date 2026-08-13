import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { successResponse } from '../utils/responseHelper';
import { UnauthorizedError } from '../utils/errors';
import { env } from '../config/env';

export class AuthHandler {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const user = await authService.register(name, email, password);
      
      // Sanitise user before returning
      const userObj = user.toObject();
      delete (userObj as any).passwordHash;

      successResponse(res, 201, 'User registered successfully', userObj);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await authService.login(email, password);

      // Set httpOnly cookie for refresh token
      const isProduction = env.NODE_ENV === 'production';
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matching env default)
      });

      successResponse(res, 200, 'Login successful', {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isProduction = env.NODE_ENV === 'production';
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
      });
      successResponse(res, 200, 'Logout successful', null);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token is missing');
      }

      const { accessToken } = await authService.refresh(refreshToken);
      successResponse(res, 200, 'Token refreshed successfully', { accessToken });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }
      successResponse(res, 200, 'Current user profile', req.user);
    } catch (error) {
      next(error);
    }
  }
}

export const authHandler = new AuthHandler();
