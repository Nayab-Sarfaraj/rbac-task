import mongoose from 'mongoose';
import { ProjectRepository } from '../repositories/project.repository';
import { UserRepository } from '../repositories/user.repository';
import { auditLogService } from './auditLog.service';
import { IProject } from '../models/project.model';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../utils/errors';
import { UserPayload } from '../types/express';

// Safely extract string ID from populated object or raw ObjectId
function toId(val: any): string {
  if (!val) return '';
  if (typeof val === 'object' && '_id' in val) return val._id.toString();
  return val.toString();
}

export class ProjectService {
  private projectRepository: ProjectRepository;
  private userRepository: UserRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
    this.userRepository = new UserRepository();
  }

  private verifyProjectAccess(project: IProject, user: UserPayload): void {
    if (user.role === 'admin') return;

    // Owner may be a populated User object or a raw ObjectId
    const ownerId =
      project.owner && typeof project.owner === 'object' && '_id' in project.owner
        ? (project.owner as any)._id.toString()
        : project.owner.toString();

    if (user.role === 'manager') {
      if (ownerId !== user.id) {
        throw new ForbiddenError('Access Denied: You do not own this project');
      }
    } else {
      // member role — members may be populated User objects or raw ObjectIds
      const isMember = project.members.some((m: any) => {
        const memberId =
          m && typeof m === 'object' && '_id' in m
            ? m._id.toString()
            : m.toString();
        return memberId === user.id;
      });
      if (!isMember) {
        throw new ForbiddenError('Access Denied: You are not a member of this project');
      }
    }
  }

  async getProjects(
    user: UserPayload,
    page: number,
    limit: number
  ): Promise<{ projects: IProject[]; total: number }> {
    const filter: any = { isDeleted: false };

    if (user.role === 'manager') {
      filter.owner = new mongoose.Types.ObjectId(user.id);
    } else if (user.role === 'member') {
      filter.members = new mongoose.Types.ObjectId(user.id);
    }

    return this.projectRepository.find(filter, page, limit);
  }

  async getProjectById(id: string, user: UserPayload): Promise<IProject> {
    const project = await this.projectRepository.findById(id, true);
    if (!project || project.isDeleted) {
      throw new NotFoundError('Project not found');
    }

    this.verifyProjectAccess(project, user);

    return project;
  }

  async createProject(
    projectData: Partial<IProject>,
    user: UserPayload
  ): Promise<IProject> {
    const project = await this.projectRepository.create({
      ...projectData,
      owner: user.id as any,
      isDeleted: false,
    });

    await auditLogService.log(user.id, 'PROJECT_CREATED', 'Project', project._id.toString(), {
      title: project.title,
    });

    return project;
  }

  async updateProject(
    id: string,
    updateData: Partial<IProject>,
    user: UserPayload
  ): Promise<IProject> {
    const project = await this.projectRepository.findById(id);
    if (!project || project.isDeleted) {
      throw new NotFoundError('Project not found');
    }

    // Must be owner or admin
    if (user.role !== 'admin' && toId(project.owner) !== user.id) {
      throw new ForbiddenError('Access Denied: Only the project owner can update it');
    }

    const previousData = { title: project.title, description: project.description };
    const updated = await this.projectRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Project not found');
    }

    await auditLogService.log(user.id, 'PROJECT_UPDATED', 'Project', id, {
      before: previousData,
      after: { title: updated.title, description: updated.description },
    });

    return updated;
  }

  async deleteProject(id: string, user: UserPayload): Promise<void> {
    const project = await this.projectRepository.findById(id);
    if (!project || project.isDeleted) {
      throw new NotFoundError('Project not found');
    }

    // Must be owner or admin
    if (user.role !== 'admin' && toId(project.owner) !== user.id) {
      throw new ForbiddenError('Access Denied: Only the project owner can delete it');
    }

    await this.projectRepository.update(id, { isDeleted: true });

    await auditLogService.log(user.id, 'PROJECT_DELETED', 'Project', id);
  }

  async addMember(id: string, memberId: string, user: UserPayload): Promise<IProject> {
    const project = await this.projectRepository.findById(id);
    if (!project || project.isDeleted) {
      throw new NotFoundError('Project not found');
    }

    // Must be owner or admin
    if (user.role !== 'admin' && toId(project.owner) !== user.id) {
      throw new ForbiddenError('Access Denied: Only the project owner can manage members');
    }
    const targetUser = await this.userRepository.findById(memberId);
    if (!targetUser || targetUser.isDeleted) {
      throw new NotFoundError('Target user not found');
    }

    if (project.members.some((m) => m.toString() === memberId)) {
      throw new BadRequestError('User is already a member of this project');
    }

    project.members.push(memberId as any);
    const updated = await project.save();

    await auditLogService.log(user.id, 'PROJECT_UPDATED', 'Project', id, {
      addedMember: memberId,
    });

    return updated;
  }

  async removeMember(id: string, memberId: string, user: UserPayload): Promise<IProject> {
    const project = await this.projectRepository.findById(id);
    if (!project || project.isDeleted) {
      throw new NotFoundError('Project not found');
    }

    // Must be owner or admin
    if (user.role !== 'admin' && toId(project.owner) !== user.id) {
      throw new ForbiddenError('Access Denied: Only the project owner can manage members');
    }

    const index = project.members.findIndex((m) => toId(m) === memberId);
    if (index === -1) {
      throw new BadRequestError('User is not a member of this project');
    }

    project.members.splice(index, 1);
    const updated = await project.save();

    await auditLogService.log(user.id, 'PROJECT_UPDATED', 'Project', id, {
      removedMember: memberId,
    });

    return updated;
  }
}

export const projectService = new ProjectService();
