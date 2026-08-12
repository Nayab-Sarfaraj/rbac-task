import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { successResponse } from '../utils/responseHelper';
import { UnauthorizedError } from '../utils/errors';

export class UserHandler {
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, search } = req.query;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);

      const { users, total } = await userService.getUsers(
        { role: role as string, search: search as string },
        page,
        limit
      );

      successResponse(res, 200, 'Users retrieved successfully', {
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const user = await userService.getUserById(id);
      successResponse(res, 200, 'User retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }
      const { id } = req.params as { id: string };
      const { role } = req.body;
      const user = await userService.updateUserRole(req.user.id, id, role);
      successResponse(res, 200, 'User role updated successfully', user);
    } catch (error) {
      next(error);
    }
  }

  async deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }
      const { id } = req.params as { id: string };
      const user = await userService.deactivateUser(req.user.id, id);
      successResponse(res, 200, 'User deactivated successfully', user);
    } catch (error) {
      next(error);
    }
  }
}

export const userHandler = new UserHandler();
