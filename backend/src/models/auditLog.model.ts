import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  actor: Types.ObjectId;
  action:
    | 'USER_CREATED'
    | 'USER_ROLE_CHANGED'
    | 'USER_DEACTIVATED'
    | 'PROJECT_CREATED'
    | 'PROJECT_UPDATED'
    | 'PROJECT_DELETED'
    | 'TASK_CREATED'
    | 'TASK_UPDATED'
    | 'TASK_DELETED'
    | 'TASK_STATUS_CHANGED';
  targetType: 'User' | 'Project' | 'Task';
  targetId: Types.ObjectId;
  metadata?: any;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        'USER_CREATED',
        'USER_ROLE_CHANGED',
        'USER_DEACTIVATED',
        'PROJECT_CREATED',
        'PROJECT_UPDATED',
        'PROJECT_DELETED',
        'TASK_CREATED',
        'TASK_UPDATED',
        'TASK_DELETED',
        'TASK_STATUS_CHANGED',
      ],
      required: true,
    },
    targetType: {
      type: String,
      enum: ['User', 'Project', 'Task'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
export default AuditLog;
