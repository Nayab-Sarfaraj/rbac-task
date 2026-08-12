import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model';
import { AuditLog } from '../models/auditLog.model';
import mongoose from 'mongoose';
import { UserPayload } from '../types/express';

export class DashboardService {
  async getStats(user: UserPayload) {
    const isDeletedFilter = { isDeleted: false };
    
    // 1. Projects Query Filter based on Role
    const projectFilter: any = { isDeleted: false };
    if (user.role === 'manager') {
      projectFilter.owner = user.id;
    } else if (user.role === 'member') {
      projectFilter.members = user.id;
    }

    // 2. Tasks Query Filter based on Role
    const taskFilter: any = { isDeleted: false };
    if (user.role === 'manager') {
      const ownedProjects = await Project.find({ owner: user.id, isDeleted: false }).select('_id');
      const projectIds = ownedProjects.map((p) => p._id);
      taskFilter.project = { $in: projectIds };
    } else if (user.role === 'member') {
      taskFilter.assignee = new mongoose.Types.ObjectId(user.id);
    }

    // 3. Status aggregates for Tasks
    const statusAggPromise = Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 4. Overdue and Upcoming Tasks filters
    const now = new Date();
    const next7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const overdueFilter = {
      ...taskFilter,
      status: { $ne: 'done' },
      dueDate: { $lt: now }
    };

    const upcomingFilter = {
      ...taskFilter,
      status: { $ne: 'done' },
      dueDate: { $gte: now, $lte: next7Days }
    };

    // Parallel execution of count/aggregation/find promises
    const [
      totalUsers,
      totalProjects,
      totalTasks,
      statusBreakdown,
      overdueTasksList,
      upcomingTasksList,
      recentLogs
    ] = await Promise.all([
      user.role === 'admin' ? User.countDocuments(isDeletedFilter) : Promise.resolve(0),
      Project.countDocuments(projectFilter),
      Task.countDocuments(taskFilter),
      statusAggPromise,
      Task.find(overdueFilter).populate('assignee', 'name email role').populate('project', 'title').limit(5).exec(),
      Task.find(upcomingFilter).populate('assignee', 'name email role').populate('project', 'title').limit(5).exec(),
      user.role === 'admin' 
        ? AuditLog.find()
            .populate('actor', 'name email role')
            .sort({ createdAt: -1 })
            .limit(5)
            .exec()
        : Promise.resolve([])
    ]);

    // Format status breakdown
    const stats = { todo: 0, in_progress: 0, done: 0 };
    statusBreakdown.forEach((group) => {
      if (group._id === 'todo') stats.todo = group.count;
      if (group._id === 'in_progress') stats.in_progress = group.count;
      if (group._id === 'done') stats.done = group.count;
    });

    return {
      totalUsers,
      totalProjects,
      totalTasks,
      taskStatusSummary: stats,
      overdueTasksCount: overdueTasksList.length,
      overdueTasks: overdueTasksList,
      upcomingTasksCount: upcomingTasksList.length,
      upcomingTasks: upcomingTasksList,
      recentAuditLogs: recentLogs
    };
  }
}

export const dashboardService = new DashboardService();
