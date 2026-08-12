import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { successResponse } from '../utils/responseHelper';
import { UnauthorizedError } from '../utils/errors';

export class TaskHandler {
  async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }

      const { status, assignee, dueDate, search, project } = req.query;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);

      const { tasks, total } = await taskService.getTasks(
        req.user,
        {
          status: status as string,
          assignee: assignee as string,
          dueDate: dueDate as string,
          search: search as string,
          project: project as string,
        },
        page,
        limit
      );

      successResponse(res, 200, 'Tasks retrieved successfully', {
        tasks,
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

  async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }
      const { id } = req.params as { id: string };
      const task = await taskService.getTaskById(id, req.user);
      successResponse(res, 200, 'Task retrieved successfully', task);
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }
      const task = await taskService.createTask(req.body, req.user);
      successResponse(res, 201, 'Task created successfully', task);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }
      const { id } = req.params as { id: string };
      const task = await taskService.updateTask(id, req.body, req.user);
      successResponse(res, 200, 'Task updated successfully', task);
    } catch (error) {
      next(error);
    }
  }

  async updateTaskStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }
      const { id } = req.params as { id: string };
      const { status } = req.body;
      const task = await taskService.updateTaskStatus(id, status, req.user);
      successResponse(res, 200, 'Task status updated successfully', task);
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }
      const { id } = req.params as { id: string };
      await taskService.deleteTask(id, req.user);
      successResponse(res, 200, 'Task deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }
}

export const taskHandler = new TaskHandler();
