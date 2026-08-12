import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { successResponse } from '../utils/responseHelper';
import { UnauthorizedError } from '../utils/errors';

export class DashboardHandler {
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }

      const stats = await dashboardService.getStats(req.user);

      successResponse(res, 200, 'Dashboard stats retrieved successfully', stats);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardHandler = new DashboardHandler();
