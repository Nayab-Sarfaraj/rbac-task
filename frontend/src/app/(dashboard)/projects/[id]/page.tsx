"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  useProject,
  useUpdateProject,
  useAddProjectMember,
  useRemoveProjectMember,
} from "@/hooks/use-projects";
import { useTasks, useCreateTask, useDeleteTask } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, UserPlus, Trash2, Plus, Edit3 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ProjectDetailsPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const router = useRouter();

  const { data: project, isLoading: loadingProject } = useProject(id);
  const { data: tasksData, isLoading: loadingTasks } = useTasks(1, 50, { projectId: id });

  // Mutations
  const updateProjectMutation = useUpdateProject(id);
  const addMemberMutation = useAddProjectMember(id);
  const removeMemberMutation = useRemoveProjectMember(id);
  const createTaskMutation = useCreateTask();
  const deleteTaskMutation = useDeleteTask();

  // Edit Project States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Add Member State
  const [memberUserId, setMemberUserId] = useState("");

  // Create Task States
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskAssigneeId, setTaskAssigneeId] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  if (loadingProject) {
    return (
      <div className="py-24 text-center text-sm text-muted-foreground animate-pulse">
        Loading project details...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Project not found or deleted.</p>
        <Link href="/projects">
          <Button variant="outline" gap-1>
            <ArrowLeft className="size-4" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const projectOwnerId =
    typeof project.owner === "object" ? project.owner._id : project.owner;
  const isOwner = projectOwnerId === user?.id;
  const canManage = user?.role === "admin" || isOwner;

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    await updateProjectMutation.mutateAsync({
      title: editTitle,
      description: editDescription,
    });
    setIsEditOpen(false);
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberUserId.trim()) return;

    await addMemberMutation.mutateAsync(memberUserId);
    setMemberUserId("");
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm("Are you sure you want to remove this member from the project?")) {
      await removeMemberMutation.mutateAsync(memberId);
    }
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    await createTaskMutation.mutateAsync({
      title: taskTitle,
      description: taskDescription,
      project: id,
      priority: taskPriority,
      assignee: taskAssigneeId || undefined,
      dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
    });

    setIsTaskOpen(false);
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("medium");
    setTaskAssigneeId("");
    setTaskDueDate("");
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTaskMutation.mutateAsync(taskId);
    }
  };

  const openEditDialog = () => {
    setEditTitle(project.title);
    setEditDescription(project.description || "");
    setIsEditOpen(true);
  };

  const tasks = tasksData?.tasks || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="outline" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{project.title}</h2>
          <p className="text-muted-foreground">
            {project.description || "No description provided."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Project info & Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Action buttons for owner/admin */}
          {canManage && (
            <div className="flex gap-2">
              <Button variant="outline" gap-1 onClick={openEditDialog}>
                <Edit3 className="size-4" />
                Edit Details
              </Button>

              <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen}>
                <DialogTrigger render={
                  <Button gap-1>
                    <Plus className="size-4" />
                    Add Task
                  </Button>
                } />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                    <DialogDescription>
                      Assign a task under this project.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateTaskSubmit} className="space-y-4 py-2">
                    <div className="space-y-1">
                      <label htmlFor="taskTitle" className="text-sm font-medium">
                        Task Title
                      </label>
                      <Input
                        id="taskTitle"
                        placeholder="e.g. Design Landing Page"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="taskDesc" className="text-sm font-medium">
                        Description
                      </label>
                      <Input
                        id="taskDesc"
                        placeholder="Detail the mockups"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="taskPriority" className="text-sm font-medium">
                          Priority
                        </label>
                        <select
                          id="taskPriority"
                          className="w-full rounded-lg border border-input bg-card p-2 text-sm"
                          value={taskPriority}
                          onChange={(e) => setTaskPriority(e.target.value)}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="taskDueDate" className="text-sm font-medium">
                          Due Date
                        </label>
                        <Input
                          id="taskDueDate"
                          type="date"
                          value={taskDueDate}
                          onChange={(e) => setTaskDueDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="taskAssignee" className="text-sm font-medium">
                        Assignee (Optional)
                      </label>
                      <select
                        id="taskAssignee"
                        className="w-full rounded-lg border border-input bg-card p-2 text-sm"
                        value={taskAssigneeId}
                        onChange={(e) => setTaskAssigneeId(e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {project.owner && (
                          <option
                            value={typeof project.owner === "object" ? project.owner._id : project.owner}
                          >
                            {typeof project.owner === "object" ? project.owner.name : "Owner"} (Owner)
                          </option>
                        )}
                        {project.members?.map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.name} ({member.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <DialogFooter className="pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsTaskOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createTaskMutation.isPending}>
                        Create Task
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Task list */}
          <Card>
            <CardHeader>
              <CardTitle>Project Tasks</CardTitle>
              <CardDescription>Tasks associated with this project</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingTasks ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 3 }).map((_, r) => (
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
              ) : tasks.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No tasks assigned to this project yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task._id}>
                        <TableCell className="font-semibold">{task.title}</TableCell>
                        <TableCell>{task.assignee?.name || "Unassigned"}</TableCell>
                        <TableCell>
                          <span className="capitalize font-semibold text-xs">{task.priority}</span>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize font-semibold text-xs border border-border px-2 py-0.5 rounded">
                            {task.status.replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {canManage && (
                            <Button
                              size="icon-sm"
                              variant="destructive"
                              onClick={() => handleDeleteTask(task._id)}
                              disabled={deleteTaskMutation.isPending}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Member management */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Members</CardTitle>
              <CardDescription>Users assigned to this project workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {canManage && (
                <form onSubmit={handleAddMemberSubmit} className="flex gap-2">
                  <Input
                    placeholder="Enter MongoDB User ID..."
                    value={memberUserId}
                    onChange={(e) => setMemberUserId(e.target.value)}
                    required
                  />
                  <Button type="submit" size="icon" disabled={addMemberMutation.isPending}>
                    <UserPlus className="size-4" />
                  </Button>
                </form>
              )}

              <div className="space-y-2">
                {project.members && project.members.length > 0 ? (
                  project.members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-none last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate uppercase">
                          {member.role}
                        </p>
                      </div>
                      {canManage && (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveMember(member._id)}
                          disabled={removeMemberMutation.isPending}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No members added.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Details Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project Details</DialogTitle>
            <DialogDescription>Change the project configuration.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label htmlFor="editTitle" className="text-sm font-medium">
                Project Title
              </label>
              <Input
                id="editTitle"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="editDesc" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="editDesc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProjectMutation.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
