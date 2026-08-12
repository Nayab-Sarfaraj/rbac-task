import mongoose from 'mongoose';
import { TaskRepository } from '../repositories/task.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { UserRepository } from '../repositories/user.repository';
import { auditLogService } from './auditLog.service';
import { ITask } from '../models/task.model';
import {
  NotFoundError,
  ForbiddenError,
} from '../utils/errors';
import { UserPayload } from '../types/express';

// Helper: safely extract string ID from either a populated object or a raw ObjectId
function toId(val: any): string {
  if (!val) return '';
  if (typeof val === 'object' && '_id' in val) return val._id.toString();
  return val.toString();
}

export class TaskService {
  private taskRepository: TaskRepository;
  private projectRepository: ProjectRepository;
  private userRepository: UserRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.projectRepository = new ProjectRepository();
    this.userRepository = new UserRepository();
  }

  // Returns all project IDs visible to this user
  private async getAccessibleProjectIds(user: UserPayload): Promise<mongoose.Types.ObjectId[]> {
    if (user.role === 'admin') return []; // admin has no restriction — caller handles this
    const uid = new mongoose.Types.ObjectId(user.id);
    const filter =
      user.role === 'manager'
        ? { owner: uid, isDeleted: false }
        : { members: uid, isDeleted: false };
    const result = await this.projectRepository.find(filter, 1, 1000);
    return result.projects.map((p) => p._id as mongoose.Types.ObjectId);
  }

  async getTasks(
    user: UserPayload,
    filters: {
      status?: string;
      assignee?: string;
      dueDate?: string;
      search?: string;
      project?: string;
    },
    page: number,
    limit: number
  ): Promise<{ tasks: ITask[]; total: number }> {
    const query: any = { isDeleted: false };

    // Scope by role
    if (user.role !== 'admin') {
      const projectIds = await this.getAccessibleProjectIds(user);
      query.project = { $in: projectIds };

      // If a specific project filter is requested, verify access
      if (filters.project) {
        const hasAccess = projectIds.some((id) => id.toString() === filters.project);
        query.project = hasAccess
          ? new mongoose.Types.ObjectId(filters.project)
          : new mongoose.Types.ObjectId(); // deliberately no match
      }
    } else if (filters.project) {
      query.project = new mongoose.Types.ObjectId(filters.project);
    }

    if (filters.status) query.status = filters.status;

    // Members cannot filter by arbitrary assignee — they see all tasks in their projects
    if (filters.assignee && user.role !== 'member') {
      query.assignee = new mongoose.Types.ObjectId(filters.assignee);
    }

    if (filters.dueDate) {
      const start = new Date(filters.dueDate);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(filters.dueDate);
      end.setUTCHours(23, 59, 59, 999);
      query.dueDate = { $gte: start, $lte: end };
    }

    if (filters.search) query.$text = { $search: filters.search };

    return this.taskRepository.find(query, page, limit);
  }

  async getTaskById(id: string, user: UserPayload): Promise<ITask> {
    const task = await this.taskRepository.findById(id, true);
    if (!task || task.isDeleted) throw new NotFoundError('Task not found');

    if (user.role !== 'admin') {
      const project: any = task.project;
      const ownerId = toId(project?.owner);

      if (user.role === 'manager') {
        if (ownerId !== user.id) {
          throw new ForbiddenError('Access Denied: You do not own the project for this task');
        }
      } else {
        // member: must be a member of the project
        const members: any[] = project?.members ?? [];
        const isMember = members.some((m) => toId(m) === user.id);
        if (!isMember) {
          throw new ForbiddenError('Access Denied: You are not a member of this project');
        }
      }
    }

    return task;
  }

  async createTask(taskData: Partial<ITask>, user: UserPayload): Promise<ITask> {
    const project = await this.projectRepository.findById(taskData.project as any);
    if (!project || project.isDeleted) throw new NotFoundError('Associated project not found');

    const ownerId = toId(project.owner);
    if (user.role !== 'admin' && ownerId !== user.id) {
      throw new ForbiddenError('Access Denied: You do not own this project');
    }

    if (taskData.assignee) {
      const assigneeUser = await this.userRepository.findById(taskData.assignee.toString());
      if (!assigneeUser || assigneeUser.isDeleted) throw new NotFoundError('Assignee user not found');
    }

    const task = await this.taskRepository.create({ ...taskData, isDeleted: false });

    await auditLogService.log(user.id, 'TASK_CREATED', 'Task', task._id.toString(), {
      title: task.title,
      project: task.project.toString(),
    });

    return task;
  }

  async updateTask(id: string, updateData: Partial<ITask>, user: UserPayload): Promise<ITask> {
    const task = await this.taskRepository.findById(id);
    if (!task || task.isDeleted) throw new NotFoundError('Task not found');

    const project = await this.projectRepository.findById(task.project.toString());
    if (!project || project.isDeleted) throw new NotFoundError('Associated project not found');

    const ownerId = toId(project.owner);
    if (user.role !== 'admin' && ownerId !== user.id) {
      throw new ForbiddenError('Access Denied: You do not own this project');
    }

    if (updateData.assignee) {
      const assigneeUser = await this.userRepository.findById(updateData.assignee.toString());
      if (!assigneeUser || assigneeUser.isDeleted) throw new NotFoundError('Assignee user not found');
    }

    const previousData = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignee: task.assignee,
    };

    const updated = await this.taskRepository.update(id, updateData);
    if (!updated) throw new NotFoundError('Task not found');

    await auditLogService.log(user.id, 'TASK_UPDATED', 'Task', id, {
      before: previousData,
      after: {
        title: updated.title,
        description: updated.description,
        status: updated.status,
        priority: updated.priority,
        dueDate: updated.dueDate,
        assignee: updated.assignee,
      },
    });

    return updated;
  }

  async updateTaskStatus(id: string, status: ITask['status'], user: UserPayload): Promise<ITask> {
    const task = await this.taskRepository.findById(id);
    if (!task || task.isDeleted) throw new NotFoundError('Task not found');

    const project = await this.projectRepository.findById(task.project.toString());
    if (!project || project.isDeleted) throw new NotFoundError('Associated project not found');

    const ownerId = toId(project.owner);

    if (user.role === 'manager') {
      if (ownerId !== user.id) {
        throw new ForbiddenError('Access Denied: You can only update tasks in projects you own');
      }
    } else if (user.role === 'member') {
      // Member must be in the project's members list
      const members: any[] = project.members ?? [];
      const isMember = members.some((m) => toId(m) === user.id);
      if (!isMember) {
        throw new ForbiddenError('Access Denied: You are not a member of this project');
      }
    }

    const previousStatus = task.status;
    task.status = status;
    const updated = await task.save();
    await updated.populate([
      { path: 'project', select: 'title owner members' },
      { path: 'assignee', select: 'name email role' },
    ]);

    await auditLogService.log(user.id, 'TASK_STATUS_CHANGED', 'Task', id, {
      before: previousStatus,
      after: status,
    });

    return updated;
  }

  async deleteTask(id: string, user: UserPayload): Promise<void> {
    const task = await this.taskRepository.findById(id);
    if (!task || task.isDeleted) throw new NotFoundError('Task not found');

    const project = await this.projectRepository.findById(task.project.toString());
    if (!project || project.isDeleted) throw new NotFoundError('Associated project not found');

    const ownerId = toId(project.owner);
    if (user.role !== 'admin' && ownerId !== user.id) {
      throw new ForbiddenError('Access Denied: You do not own this project');
    }

    await this.taskRepository.update(id, { isDeleted: true });
    await auditLogService.log(user.id, 'TASK_DELETED', 'Task', id);
  }
}

export const taskService = new TaskService();
