import { AuditLog, IAuditLog } from '../models/auditLog.model';

export class AuditLogRepository {
  async create(logData: Partial<IAuditLog>): Promise<IAuditLog> {
    const log = new AuditLog(logData);
    return log.save();
  }

  async find(
    filter: any,
    page: number,
    limit: number
  ): Promise<{ logs: IAuditLog[]; total: number }> {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('actor', 'name email role')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      AuditLog.countDocuments(filter).exec(),
    ]);
    return { logs, total };
  }
}
