import { Schema, model, Document, Types } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description?: string;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
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
projectSchema.index({ owner: 1, isDeleted: 1 });

export const Project = model<IProject>('Project', projectSchema);
export default Project;
