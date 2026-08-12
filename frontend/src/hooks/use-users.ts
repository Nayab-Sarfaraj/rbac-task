import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { formatError } from "@/lib/error-formatter";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "member";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useUsers(page = 1, limit = 10, filters: { role?: string; search?: string } = {}, enabled = true) {
  const queryParams = new URLSearchParams();
  queryParams.append("page", String(page));
  queryParams.append("limit", String(limit));
  if (filters.role) queryParams.append("role", filters.role);
  if (filters.search) queryParams.append("search", filters.search);

  return useQuery({
    queryKey: ["users", page, limit, filters],
    queryFn: async () => {
      const res = await api.get(`/users?${queryParams.toString()}`);
      const data = res.data.data;
      return {
        users: data.users || [],
        total: data.pagination?.total || 0,
      };
    },
    enabled,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await api.patch(`/users/${id}/role`, { role });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User role updated successfully");
    },
    onError: (err: unknown) => {
      toast.error(formatError(err));
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/users/${id}/deactivate`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deactivated successfully");
    },
    onError: (err: unknown) => {
      toast.error(formatError(err));
    },
  });
}
