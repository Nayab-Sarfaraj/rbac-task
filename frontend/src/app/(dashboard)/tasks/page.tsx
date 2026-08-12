"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  useTasks,
  useUpdateTask,
  useUpdateTaskStatus,
  useDeleteTask,
} from "@/hooks/use-tasks";
import { useProject } from "@/hooks/use-projects";
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
} from "@/components/ui/dialog";
import { Search, Edit, Trash2, Eye } from "lucide-react";
import { Task } from "@/hooks/use-tasks";

export default function TasksPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 10;

  // Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState(""); // extra filter
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");

  const filters = {
    search: search || undefined,
    status: statusFilter || undefined,
    assignee: assigneeFilter || undefined,
    dueDate: dueDateFilter || undefined,
  };

  const { data, isLoading } = useTasks(page, limit, filters);
  const updateTaskMutation = useUpdateTask();
  const updateStatusMutation = useUpdateTaskStatus();
  const deleteTaskMutation = useDeleteTask();

  // Selected Task for Details/Edit Modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { data: projectDetails } = useProject(selectedProjectId || "");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Edit fields (for Admin/Manager in modal)
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState<Task["status"]>("todo");
  const [editPriority, setEditPriority] = useState<Task["priority"]>("medium");
  const [editAssignee, setEditAssignee] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  const handleRowClick = (task: Task) => {
    setSelectedTask(task);
    const projId = typeof task.project === "object" ? task.project._id : task.project;
    setSelectedProjectId(projId);
    setEditTitle(task.title);
    setEditDesc(task.description || "");
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setEditAssignee(task.assignee?._id || "");
    setEditDueDate(
      task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
    );
    setIsDetailsOpen(true);
  };

  const handleUpdateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    const isMember = user?.role === "member";

    if (isMember) {
      // Members can only update status
      await updateStatusMutation.mutateAsync({
        id: selectedTask._id,
        status: editStatus,
      });
    } else {
      // Admins and Managers can edit everything
      await updateTaskMutation.mutateAsync({
        id: selectedTask._id,
        title: editTitle,
        description: editDesc,
        status: editStatus,
        priority: editPriority,
        assignee: editAssignee || undefined,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : undefined,
      });
    }
    setIsDetailsOpen(false);
  };

  const handleInlineStatusChange = async (taskId: string, newStatus: Task["status"]) => {
    await updateStatusMutation.mutateAsync({ id: taskId, status: newStatus });
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTaskMutation.mutateAsync(id);
    }
  };

  const tasks = data?.tasks || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const isAdminOrManager = user?.role === "admin" || user?.role === "manager";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
        <p className="text-muted-foreground">
          View, edit, and track statuses of project tasks.
        </p>
      </div>

      {/* Filters bar */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="w-[150px] space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Status</label>
            <select
              className="w-full rounded-lg border border-input bg-card p-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {user?.role !== "member" && (
            <div className="w-[180px] space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Assignee ID</label>
              <Input
                placeholder="User ID..."
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
              />
            </div>
          )}

          <div className="w-[150px] space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Due Date</label>
            <Input
              type="date"
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, r) => (
                  <TableRow key={r}>
                    {Array.from({ length: 7 }).map((_, c) => (
                      <TableCell key={c}>
                        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : tasks.length === 0 ? (
            <div className="py-24 text-center text-sm text-muted-foreground">
              No tasks found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const isTaskAssignee = task.assignee?._id === user?.id;
                  const canChangeStatus = isAdminOrManager || isTaskAssignee;
                  const projectTitle = typeof task.project === "object" ? task.project.title : "Unknown Project";

                  return (
                    <TableRow
                      key={task._id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => handleRowClick(task)}
                    >
                      <TableCell className="font-semibold">{task.title}</TableCell>
                      <TableCell>{projectTitle}</TableCell>
                      <TableCell>{task.assignee?.name || "Unassigned"}</TableCell>
                      <TableCell>
                        <span className="capitalize font-semibold text-xs">{task.priority}</span>
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {canChangeStatus ? (
                          <select
                            className="rounded border border-input bg-card p-1 text-xs font-medium"
                            value={task.status}
                            onChange={(e) =>
                              handleInlineStatusChange(task._id, e.target.value as Task["status"])
                            }
                          >
                            <option value="todo">Todo</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        ) : (
                          <span className="capitalize font-medium text-xs">
                            {task.status.replace("_", " ")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon-sm" variant="outline" onClick={() => handleRowClick(task)}>
                            <Eye className="size-4" />
                          </Button>
                          {isAdminOrManager && (
                            <Button
                              size="icon-sm"
                              variant="destructive"
                              onClick={(e) => handleDelete(task._id, e)}
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

      {/* Details/Edit Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAdminOrManager ? "Edit Task" : "Task Details"}</DialogTitle>
            <DialogDescription>
              {isAdminOrManager
                ? "Modify the fields of this project task."
                : "View task info and update its progress status."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateTaskSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Task Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={!isAdminOrManager}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                disabled={!isAdminOrManager}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full rounded-lg border border-input bg-card p-2 text-sm"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Task["status"])}
                  disabled={!isAdminOrManager && selectedTask?.assignee?._id !== user?.id}
                >
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Priority</label>
                <select
                  className="w-full rounded-lg border border-input bg-card p-2 text-sm"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as Task["priority"])}
                  disabled={!isAdminOrManager}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {isAdminOrManager && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Assignee (Optional)</label>
                  <select
                    className="w-full rounded-lg border border-input bg-card p-2 text-sm"
                    value={editAssignee}
                    onChange={(e) => setEditAssignee(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {projectDetails?.owner && (
                      <option
                        value={
                          typeof projectDetails.owner === "object"
                            ? projectDetails.owner._id
                            : projectDetails.owner
                        }
                      >
                        {typeof projectDetails.owner === "object"
                          ? projectDetails.owner.name
                          : "Owner"}{" "}
                        (Owner)
                      </option>
                    )}
                    {projectDetails?.members?.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
