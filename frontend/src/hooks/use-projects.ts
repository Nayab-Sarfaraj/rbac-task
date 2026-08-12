import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { formatError } from "@/lib/error-formatter";

export interface Project {
  _id: string;
  title: string;
  description?: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | string;
  members: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export function useProjects(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["projects", page, limit],
    queryFn: async () => {
      const res = await api.get(`/projects?page=${page}&limit=${limit}`);
      const data = res.data.data;
      return {
        projects: data.projects || [],
        total: data.pagination?.total || 0,
      };
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await api.get(`/projects/${id}`);
      return res.data.data as Project;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const res = await api.post("/projects", data);
      return res.data.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully");
    },
    onError: (err: unknown) => {
      toast.error(formatError(err));
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title?: string; description?: string }) => {
      const res = await api.patch(`/projects/${id}`, data);
      return res.data.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Project updated successfully");
    },
    onError: (err: unknown) => {
      toast.error(formatError(err));
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted successfully");
    },
    onError: (err: unknown) => {
      toast.error(formatError(err));
    },
  });
}

export function useAddProjectMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.post(`/projects/${projectId}/members`, { userId });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Member added to project");
    },
    onError: (err: unknown) => {
      toast.error(formatError(err));
    },
  });
}

export function useRemoveProjectMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/projects/${projectId}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Member removed from project");
    },
    onError: (err: unknown) => {
      toast.error(formatError(err));
    },
  });
}
