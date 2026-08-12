import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model';
import { AuditLog } from '../models/auditLog.model';
import mongoose from 'mongoose';
import { UserPayload } from '../types/express';

export class DashboardService {
  async getStats(user: UserPayload) {
    const uid = new mongoose.Types.ObjectId(user.id);
    const now = new Date();
    const next7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 1. Projects Query Filter based on Role
    const projectFilter: any = { isDeleted: false };
    if (user.role === 'manager') {
      projectFilter.owner = uid;
    } else if (user.role === 'member') {
      projectFilter.members = uid;
    }

    // 2. Personal Assigned Tasks Filter (Always based on assignee)
    const personalTaskFilter = {
      assignee: uid,
      isDeleted: false,
    };

    // 3. Workspace/Project Tasks Filter (General scope)
    const projectTaskFilter: any = { isDeleted: false };
    if (user.role === 'manager') {
      const ownedProjects = await Project.find({ owner: uid, isDeleted: false }).select('_id');
      projectTaskFilter.project = { $in: ownedProjects.map((p) => p._id) };
    } else if (user.role === 'member') {
      const memberProjects = await Project.find({ members: uid, isDeleted: false }).select('_id');
      projectTaskFilter.project = { $in: memberProjects.map((p) => p._id) };
    }
    // Admin has no project scope restriction (gets all active tasks)

    // Parallel Aggregations and Counts
    const [
      totalUsers,
      totalProjects,
      // Personal task aggregates
      personalTasksCount,
      personalStatusBreakdown,
      personalOverdueList,
      personalUpcomingList,
      // Project task aggregates
      projectTasksCount,
      projectStatusBreakdown,
      projectOverdueList,
      projectUpcomingList,
      // Audit logs (Admin only)
      recentLogs,
    ] = await Promise.all([
      user.role === 'admin' ? User.countDocuments({ isDeleted: false }) : Promise.resolve(0),
      Project.countDocuments(projectFilter),

      // Personal Tasks
      Task.countDocuments(personalTaskFilter),
      Task.aggregate([
        { $match: personalTaskFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.find({ ...personalTaskFilter, status: { $ne: 'done' }, dueDate: { $lt: now } })
        .populate('assignee', 'name email role')
        .populate('project', 'title')
        .limit(5)
        .exec(),
      Task.find({ ...personalTaskFilter, status: { $ne: 'done' }, dueDate: { $gte: now, $lte: next7Days } })
        .populate('assignee', 'name email role')
        .populate('project', 'title')
        .limit(5)
        .exec(),

      // Project/Workspace Tasks
      Task.countDocuments(projectTaskFilter),
      Task.aggregate([
        { $match: projectTaskFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.find({ ...projectTaskFilter, status: { $ne: 'done' }, dueDate: { $lt: now } })
        .populate('assignee', 'name email role')
        .populate('project', 'title')
        .limit(5)
        .exec(),
      Task.find({ ...projectTaskFilter, status: { $ne: 'done' }, dueDate: { $gte: now, $lte: next7Days } })
        .populate('assignee', 'name email role')
        .populate('project', 'title')
        .limit(5)
        .exec(),

      // Logs
      user.role === 'admin'
        ? AuditLog.find()
            .populate('actor', 'name email role')
            .sort({ createdAt: -1 })
            .limit(5)
            .exec()
        : Promise.resolve([]),
    ]);

    // Format status summary helper
    const formatStatusBreakdown = (breakdown: any[]) => {
      const stats = { todo: 0, in_progress: 0, done: 0 };
      breakdown.forEach((group) => {
        if (group._id === 'todo') stats.todo = group.count;
        if (group._id === 'in_progress') stats.in_progress = group.count;
        if (group._id === 'done') stats.done = group.count;
      });
      return stats;
    };

    return {
      totalUsers,
      totalProjects,
      recentAuditLogs: recentLogs,

      // Personal Tasks Stats
      personalTasks: {
        total: personalTasksCount,
        statusSummary: formatStatusBreakdown(personalStatusBreakdown),
        overdueCount: personalOverdueList.length,
        overdue: personalOverdueList,
        upcomingCount: personalUpcomingList.length,
        upcoming: personalUpcomingList,
      },

      // Project Tasks Stats
      projectTasks: {
        total: projectTasksCount,
        statusSummary: formatStatusBreakdown(projectStatusBreakdown),
        overdueCount: projectOverdueList.length,
        overdue: projectOverdueList,
        upcomingCount: projectUpcomingList.length,
        upcoming: projectUpcomingList,
      },
    };
  }
}

export const dashboardService = new DashboardService();
