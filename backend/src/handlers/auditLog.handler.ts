import { Request, Response, NextFunction } from 'express';
import { auditLogService } from '../services/auditLog.service';
import { successResponse } from '../utils/responseHelper';

export class AuditLogHandler {
  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { actor, action, targetType, startDate, endDate } = req.query;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);

      const { logs, total } = await auditLogService.getAuditLogs(
        {
          actor: actor as string,
          action: action as string,
          targetType: targetType as string,
          startDate: startDate as string,
          endDate: endDate as string,
        },
        page,
        limit
      );

      successResponse(res, 200, 'Audit logs retrieved successfully', {
        logs,
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
}

export const auditLogHandler = new AuditLogHandler();
