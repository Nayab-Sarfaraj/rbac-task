import { Project, IProject } from '../models/project.model';
import mongoose from 'mongoose';

export class ProjectRepository {
  async findById(id: string, populate = false): Promise<IProject | null> {
    const query = Project.findById(id);
    if (populate) {
      query.populate('owner', 'name email role').populate('members', 'name email role');
    }
    return query.exec();
  }

  async create(projectData: Partial<IProject>): Promise<IProject> {
    const project = new Project(projectData);
    return project.save();
  }

  async update(id: string, updateData: mongoose.UpdateQuery<IProject>): Promise<IProject | null> {
    return Project.findByIdAndUpdate(id, updateData, { new: true })
      .populate('owner', 'name email role')
      .populate('members', 'name email role')
      .exec();
  }

  async find(
    filter: any,
    page: number,
    limit: number
  ): Promise<{ projects: IProject[]; total: number }> {
    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('owner', 'name email role')
        .populate('members', 'name email role')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      Project.countDocuments(filter).exec(),
    ]);
    return { projects, total };
  }
}
