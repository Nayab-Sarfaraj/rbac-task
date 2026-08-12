"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
} from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Eye, Trash2 } from "lucide-react";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 10;

  // Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const { data, isLoading } = useProjects(page, limit);
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await createProjectMutation.mutateAsync({
      title: newTitle,
      description: newDescription,
    });

    setIsCreateOpen(false);
    setNewTitle("");
    setNewDescription("");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project? This will soft-delete the project.")) {
      await deleteProjectMutation.mutateAsync(id);
    }
  };

  const isManagerOrAdmin = user?.role === "admin" || user?.role === "manager";
  const projects = data?.projects || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">
            Manage and view projects assigned to your role scope.
          </p>
        </div>

        {isManagerOrAdmin && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger render={
              <Button gap-1>
                <Plus className="size-4" />
                New Project
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Create a new project workspace. You will be assigned as the owner.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 py-2">
                <div className="space-y-1">
                  <label htmlFor="title" className="text-sm font-medium">
                    Project Title
                  </label>
                  <Input
                    id="title"
                    placeholder="e.g. Website Redesign"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Input
                    id="description"
                    placeholder="e.g. Migrate the client legacy portal"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createProjectMutation.isPending}>
                    {createProjectMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, r) => (
                  <TableRow key={r}>
                    {Array.from({ length: 5 }).map((_, c) => (
                      <TableCell key={c}>
                        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : projects.length === 0 ? (
            <div className="py-24 text-center text-sm text-muted-foreground">
              No projects found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => {
                  const ownerName =
                    typeof project.owner === "object"
                      ? project.owner.name
                      : "Unknown Owner";
                  const isOwner =
                    typeof project.owner === "object"
                      ? project.owner._id === user?.id
                      : project.owner === user?.id;

                  return (
                    <TableRow key={project._id}>
                      <TableCell className="font-semibold">{project.title}</TableCell>
                      <TableCell>{ownerName}</TableCell>
                      <TableCell>{project.members?.length || 0} members</TableCell>
                      <TableCell>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/projects/${project._id}`}>
                            <Button size="icon-sm" variant="outline">
                              <Eye className="size-4" />
                            </Button>
                          </Link>
                          {(user?.role === "admin" || isOwner) && (
                            <Button
                              size="icon-sm"
                              variant="destructive"
                              onClick={() => handleDelete(project._id)}
                              disabled={deleteProjectMutation.isPending}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="text-sm font-medium text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
