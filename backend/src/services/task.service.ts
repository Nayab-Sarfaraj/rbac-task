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

export class TaskService {
  private taskRepository: TaskRepository;
  private projectRepository: ProjectRepository;
  private userRepository: UserRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.projectRepository = new ProjectRepository();
    this.userRepository = new UserRepository();
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
    let projectIds: any[] = [];

    // Apply role-based visibility scoping
    if (user.role === 'manager') {
      // Find all projects owned by manager
      const projects = await this.projectRepository.find({ owner: user.id, isDeleted: false }, 1, 1000);
      projectIds = projects.projects.map((p) => p._id);
      query.project = { $in: projectIds };
    } else if (user.role === 'member') {
      query.assignee = user.id;
    }

    // Apply filter query params
    if (filters.status) {
      query.status = filters.status;
    }
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
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    if (filters.project) {
      if (user.role === 'manager') {
        const ownsProject = projectIds.some((pId) => pId.toString() === filters.project);
        if (ownsProject) {
          query.project = new mongoose.Types.ObjectId(filters.project);
        } else {
          query.project = new mongoose.Types.ObjectId();
        }
      } else {
        query.project = new mongoose.Types.ObjectId(filters.project);
      }
    }

    return this.taskRepository.find(query, page, limit);
  }

  async getTaskById(id: string, user: UserPayload): Promise<ITask> {
    const task = await this.taskRepository.findById(id, true);
    if (!task || task.isDeleted) {
      throw new NotFoundError('Task not found');
    }

    const project: any = task.project;

    // Permissions check
    if (user.role !== 'admin') {
      if (user.role === 'manager') {
        if (project.owner.toString() !== user.id) {
          throw new ForbiddenError('Access Denied: You do not own the project for this task');
        }
      } else {
        // member
        if (task.assignee?.toString() !== user.id) {
          throw new ForbiddenError('Access Denied: This task is not assigned to you');
        }
      }
    }

    return task;
  }

  async createTask(taskData: Partial<ITask>, user: UserPayload): Promise<ITask> {
    // Verify project exists and is active
    const project = await this.projectRepository.findById(taskData.project as any);
    if (!project || project.isDeleted) {
      throw new NotFoundError('Associated project not found');
    }

    // Verify Manager ownership
    if (user.role !== 'admin' && project.owner.toString() !== user.id) {
      throw new ForbiddenError('Access Denied: You do not own this project');
    }

    // Verify assignee exists
    if (taskData.assignee) {
      const assigneeUser = await this.userRepository.findById(taskData.assignee.toString());
      if (!assigneeUser || assigneeUser.isDeleted) {
        throw new NotFoundError('Assignee user not found');
      }
    }

    const task = await this.taskRepository.create({
      ...taskData,
      isDeleted: false,
    });

    await auditLogService.log(user.id, 'TASK_CREATED', 'Task', task._id.toString(), {
      title: task.title,
      project: task.project.toString(),
    });

    return task;
  }

  async updateTask(id: string, updateData: Partial<ITask>, user: UserPayload): Promise<ITask> {
    const task = await this.taskRepository.findById(id);
    if (!task || task.isDeleted) {
      throw new NotFoundError('Task not found');
    }

    const project = await this.projectRepository.findById(task.project.toString());
    if (!project || project.isDeleted) {
      throw new NotFoundError('Associated project not found');
    }

    // Verify ownership
    if (user.role !== 'admin' && project.owner.toString() !== user.id) {
      throw new ForbiddenError('Access Denied: You do not own this project');
    }

    // Verify assignee if provided
    if (updateData.assignee) {
      const assigneeUser = await this.userRepository.findById(updateData.assignee.toString());
      if (!assigneeUser || assigneeUser.isDeleted) {
        throw new NotFoundError('Assignee user not found');
      }
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
    if (!updated) {
      throw new NotFoundError('Task not found');
    }

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
    if (!task || task.isDeleted) {
      throw new NotFoundError('Task not found');
    }

    const project = await this.projectRepository.findById(task.project.toString());
    if (!project || project.isDeleted) {
      throw new NotFoundError('Associated project not found');
    }

    // Role specific checks
    if (user.role === 'member') {
      if (task.assignee?.toString() !== user.id) {
        throw new ForbiddenError('Access Denied: You can only update status of tasks assigned to you');
      }
    } else if (user.role === 'manager') {
      if (project.owner.toString() !== user.id) {
        throw new ForbiddenError('Access Denied: You can only update tasks in projects you own');
      }
    }

    const previousStatus = task.status;
    task.status = status;
    const updated = await task.save();
    await updated.populate([
      { path: 'project', select: 'title owner members' },
      { path: 'assignee', select: 'name email role' }
    ]);

    await auditLogService.log(user.id, 'TASK_STATUS_CHANGED', 'Task', id, {
      before: previousStatus,
      after: status,
    });

    return updated;
  }

  async deleteTask(id: string, user: UserPayload): Promise<void> {
    const task = await this.taskRepository.findById(id);
    if (!task || task.isDeleted) {
      throw new NotFoundError('Task not found');
    }

    const project = await this.projectRepository.findById(task.project.toString());
    if (!project || project.isDeleted) {
      throw new NotFoundError('Associated project not found');
    }

    // Verify ownership
    if (user.role !== 'admin' && project.owner.toString() !== user.id) {
      throw new ForbiddenError('Access Denied: You do not own this project');
    }

    await this.taskRepository.update(id, { isDeleted: true });

    await auditLogService.log(user.id, 'TASK_DELETED', 'Task', id);
  }
}

export const taskService = new TaskService();
