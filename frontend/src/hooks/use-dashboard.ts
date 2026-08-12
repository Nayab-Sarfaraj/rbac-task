import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface TaskStatDetail {
  total: number;
  statusSummary: {
    todo: number;
    in_progress: number;
    done: number;
  };
  overdueCount: number;
  overdue: Array<{
    _id: string;
    title: string;
    dueDate?: string;
    status: string;
    priority: string;
    assignee?: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
  }>;
  upcomingCount: number;
  upcoming: Array<{
    _id: string;
    title: string;
    dueDate?: string;
    status: string;
    priority: string;
  }>;
}

export interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  personalTasks: TaskStatDetail;
  projectTasks: TaskStatDetail;
  recentAuditLogs: Array<{
    _id: string;
    actor: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
    action: string;
    targetType: string;
    targetId: string;
    metadata?: any;
    createdAt: string;
  }>;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const res = await api.get("/dashboard/stats");
      return res.data.data as DashboardStats;
    },
  });
}
