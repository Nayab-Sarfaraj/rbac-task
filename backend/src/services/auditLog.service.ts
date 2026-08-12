import { AuditLogRepository } from '../repositories/auditLog.repository';
import { IAuditLog } from '../models/auditLog.model';

export class AuditLogService {
  private auditLogRepository: AuditLogRepository;

  constructor() {
    this.auditLogRepository = new AuditLogRepository();
  }

  async log(
    actorId: string,
    action: IAuditLog['action'],
    targetType: IAuditLog['targetType'],
    targetId: string,
    metadata?: any
  ): Promise<IAuditLog> {
    return this.auditLogRepository.create({
      actor: actorId as any,
      action,
      targetType,
      targetId: targetId as any,
      metadata,
    });
  }

  async getAuditLogs(
    filters: {
      actor?: string;
      action?: string;
      targetType?: string;
      startDate?: string;
      endDate?: string;
    },
    page: number,
    limit: number
  ): Promise<{ logs: IAuditLog[]; total: number }> {
    const query: any = {};

    if (filters.actor) {
      query.actor = filters.actor;
    }
    if (filters.action) {
      query.action = filters.action;
    }
    if (filters.targetType) {
      query.targetType = filters.targetType;
    }
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    return this.auditLogRepository.find(query, page, limit);
  }
}

export const auditLogService = new AuditLogService();
