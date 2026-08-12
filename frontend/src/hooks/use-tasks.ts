import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { formatError } from "@/lib/error-formatter";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  project: {
    _id: string;
    title: string;
    owner: string;
  } | string;
  assignee?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TasksFilters {
  status?: string;
  assignee?: string;
  dueDate?: string;
  search?: string;
  projectId?: string;
}

export function useTasks(page = 1, limit = 10, filters: TasksFilters = {}) {
  const queryParams = new URLSearchParams();
  queryParams.append("page", String(page));
  queryParams.append("limit", String(limit));
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.assignee) queryParams.append("assignee", filters.assignee);
  if (filters.dueDate) queryParams.append("dueDate", new Date(filters.dueDate).toISOString());
  if (filters.search) queryParams.append("search", filters.search);
  if (filters.projectId) queryParams.append("project", filters.projectId);

  return useQuery({
    queryKey: ["tasks", page, limit, filters],
    queryFn: async () => {
      const res = await api.get(`/tasks?${queryParams.toString()}`);
      const data = res.data.data;
      return {
        tasks: data.tasks || [],
        total: data.pagination?.total || 0,
      };
    },
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await api.get(`/tasks/${id}`);
      return res.data.data as Task;
    },
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      project: string;
      assignee?: string;
      priority?: string;
      dueDate?: string;
    }) => {
      const res = await api.post("/tasks", data);
      return res.data.data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Task created successfully");
    },
    onError: (err: unknown) => {
      toast.error(formatError(err));
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      description?: string;
      status?: Task["status"];
      project?: string;
      assignee?: string;
      priority?: string;
      dueDate?: string;
    }) => {
      const res = await api.patch(`/tasks/${id}`, data);
      return res.data.data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", data._id] });
      toast.success("Task updated successfully");
    },
    onError: (err: unknown) => {
      toast.error(formatError(err));
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Task["status"] }) => {
      const res = await api.patch(`/tasks/${id}/status`, { status });
      return res.data.data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", data._id] });
      toast.success("Task status updated");
    },
    onError: (err: unknown) => {
      toast.error(formatError(err));
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully");
    },
    onError: (err: unknown) => {
      toast.error(formatError(err));
    },
  });
}
