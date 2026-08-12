import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface AuditLog {
  _id: string;
  actor: {
    _id: string;
    name: string;
    email: string;
  };
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export function useAuditLogs(
  page = 1,
  limit = 10,
  filters: { actor?: string; action?: string; targetType?: string } = {},
  enabled = true
) {
  const queryParams = new URLSearchParams();
  queryParams.append("page", String(page));
  queryParams.append("limit", String(limit));
  if (filters.actor) queryParams.append("actor", filters.actor);
  if (filters.action) queryParams.append("action", filters.action);
  if (filters.targetType) queryParams.append("targetType", filters.targetType);

  return useQuery({
    queryKey: ["auditLogs", page, limit, filters],
    queryFn: async () => {
      const res = await api.get(`/audit-logs?${queryParams.toString()}`);
      const data = res.data.data;
      return {
        auditLogs: data.logs || [],
        total: data.pagination?.total || 0,
      };
    },
    enabled,
  });
}
