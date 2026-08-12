import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/project.service';
import { successResponse } from '../utils/responseHelper';
import { UnauthorizedError } from '../utils/errors';

export class ProjectHandler {
  async getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);

      const { projects, total } = await projectService.getProjects(req.user, page, limit);

      successResponse(res, 200, 'Projects retrieved successfully', {
        projects,
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

  async getProjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }
      const { id } = req.params as { id: string };
      const project = await projectService.getProjectById(id, req.user);
      successResponse(res, 200, 'Project retrieved successfully', project);
    } catch (error) {
      next(error);
    }
  }

  async createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }
      const { title, description } = req.body;
      const project = await projectService.createProject({ title, description }, req.user);
      successResponse(res, 201, 'Project created successfully', project);
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }
      const { id } = req.params as { id: string };
      const project = await projectService.updateProject(id, req.body, req.user);
      successResponse(res, 200, 'Project updated successfully', project);
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }
      const { id } = req.params as { id: string };
      await projectService.deleteProject(id, req.user);
      successResponse(res, 200, 'Project deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }

  async addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }
      const { id } = req.params as { id: string };
      const { userId } = req.body;
      const project = await projectService.addMember(id, userId, req.user);
      successResponse(res, 200, 'Member added to project successfully', project);
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }
      const { id, userId } = req.params as { id: string; userId: string };
      const project = await projectService.removeMember(id, userId, req.user);
      successResponse(res, 200, 'Member removed from project successfully', project);
    } catch (error) {
      next(error);
    }
  }
}

export const projectHandler = new ProjectHandler();
