import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  taskStatusSummary: {
    todo: number;
    in_progress: number;
    done: number;
  };
  overdueTasksCount: number;
  upcomingTasksCount: number;
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
