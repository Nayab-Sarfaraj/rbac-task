import { Task, ITask } from '../models/task.model';
import mongoose from 'mongoose';

export class TaskRepository {
  async findById(id: string, populate = false): Promise<ITask | null> {
    const query = Task.findById(id);
    if (populate) {
      query.populate('project', 'title owner members').populate('assignee', 'name email role');
    }
    return query.exec();
  }

  async create(taskData: Partial<ITask>): Promise<ITask> {
    const task = new Task(taskData);
    const saved = await task.save();
    return saved.populate([
      { path: 'project', select: 'title owner members' },
      { path: 'assignee', select: 'name email role' }
    ]);
  }

  async update(id: string, updateData: mongoose.UpdateQuery<ITask>): Promise<ITask | null> {
    return Task.findByIdAndUpdate(id, updateData, { new: true })
      .populate('project', 'title owner members')
      .populate('assignee', 'name email role')
      .exec();
  }

  async find(
    filter: any,
    page: number,
    limit: number
  ): Promise<{ tasks: ITask[]; total: number }> {
    const skip = (page - 1) * limit;
    
    // Check if there is text search in the filter. If so, sort by text score relevance or just search.
    const query = Task.find(filter);
    
    if (filter.$text) {
      query.select({ score: { $meta: 'textScore' } });
      query.sort({ score: { $meta: 'textScore' } });
    } else {
      query.sort({ createdAt: -1 });
    }

    const [tasks, total] = await Promise.all([
      query
        .populate('project', 'title owner members')
        .populate('assignee', 'name email role')
        .skip(skip)
        .limit(limit)
        .exec(),
      Task.countDocuments(filter).exec(),
    ]);

    return { tasks, total };
  }
}
