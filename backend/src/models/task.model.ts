import { Schema, model, Document, Types } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  project: Types.ObjectId;
  assignee?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      required: true,
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
taskSchema.index({ project: 1, isDeleted: 1 });
taskSchema.index({ title: 'text' });

export const Task = model<ITask>('Task', taskSchema);
export default Task;
