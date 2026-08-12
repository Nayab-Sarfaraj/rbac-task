import { Request, Response } from 'express';
import { successResponse } from '../utils/responseHelper';

export class SystemHandler {
  getHealth(_req: Request, res: Response): void {
    successResponse(res, 200, 'System health details', {
      status: 'ok',
      uptime: process.uptime(),
    });
  }
}

export const systemHandler = new SystemHandler();
