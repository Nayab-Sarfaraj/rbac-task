"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FolderKanban, CheckSquare, Users as UsersIcon, AlertTriangle, Activity } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading: isDashboardLoading } = useDashboardStats();

  const role = user?.role;

  if (isDashboardLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <div className="h-9 w-48 bg-muted rounded animate-pulse" />
          <div className="h-5 w-96 bg-muted rounded mt-2 animate-pulse" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="size-4 bg-muted rounded-full" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-8 w-12 bg-muted rounded" />
                <div className="h-3 w-36 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Left card skeleton */}
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-5 w-36 bg-muted rounded" />
              <div className="h-4 w-64 bg-muted rounded mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 text-sm border-b border-border pb-3 last:border-0 last:pb-0 animate-pulse">
                  <div className="bg-muted size-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                  </div>
                  <div className="h-3 w-12 bg-muted rounded" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Right card skeleton */}
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-5 w-36 bg-muted rounded" />
              <div className="h-4 w-64 bg-muted rounded mt-1" />
            </CardHeader>
            <CardContent className="flex flex-col justify-center h-48 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-3 w-16 bg-muted rounded" />
                    <div className="h-3 w-12 bg-muted rounded" />
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculated Stats
  const totalProjects = stats?.totalProjects || 0;
  const totalTasks = stats?.totalTasks || 0;
  const totalUsers = stats?.totalUsers || 0;

  const todoTasksCount = stats?.taskStatusSummary?.todo || 0;
  const inProgressTasksCount = stats?.taskStatusSummary?.in_progress || 0;
  const doneTasksCount = stats?.taskStatusSummary?.done || 0;

  const overdueTasks = stats?.overdueTasks || [];
  const upcomingTasks = stats?.upcomingTasks || [];
  const auditLogs = stats?.recentAuditLogs || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}. Here is a summary of your workspace activity.
        </p>
      </div>

      {/* ADMIN DASHBOARD WIDGETS */}
      {role === "admin" && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <UsersIcon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">Registered in the database</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FolderKanban className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProjects}</div>
                <p className="text-xs text-muted-foreground">System-wide active projects</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <CheckSquare className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTasks}</div>
                <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                  <span className="text-zinc-500 font-semibold">{todoTasksCount} Todo</span>
                  <span className="text-blue-500 font-semibold">{inProgressTasksCount} In Progress</span>
                  <span className="text-green-500 font-semibold">{doneTasksCount} Done</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Audit Trail</CardTitle>
                <CardDescription>Latest mutations recorded across the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs && auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <div key={log._id} className="flex items-center gap-4 text-sm border-b border-border pb-3 last:border-0 last:pb-0">
                        <div className="bg-muted p-2 rounded-full">
                          <Activity className="size-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {log.action.replace("_", " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            By {log.actor?.name || "System"} on {log.targetType} ({log.targetId})
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground py-4 text-center">No logs found</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Status Summary</CardTitle>
                <CardDescription>Global breakdown of task workflow state</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col justify-center h-48 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Todo</span>
                    <span>{todoTasksCount} / {totalTasks}</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-zinc-400 h-full" style={{ width: `${totalTasks ? (todoTasksCount / totalTasks) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>In Progress</span>
                    <span>{inProgressTasksCount} / {totalTasks}</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${totalTasks ? (inProgressTasksCount / totalTasks) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Done</span>
                    <span>{doneTasksCount} / {totalTasks}</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: `${totalTasks ? (doneTasksCount / totalTasks) * 100 : 0}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* MANAGER DASHBOARD WIDGETS */}
      {role === "manager" && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">My Projects</CardTitle>
                <FolderKanban className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProjects}</div>
                <p className="text-xs text-muted-foreground">Owned projects managed by you</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Team Tasks</CardTitle>
                <CheckSquare className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {inProgressTasksCount} currently active, {doneTasksCount} completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
                <AlertTriangle className="size-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
                <p className="text-xs text-muted-foreground">Tasks past their due date</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Team Task Breakdown</CardTitle>
                <CardDescription>Workflow metrics for tasks on your projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Todo</span>
                    <span>{todoTasksCount}</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-zinc-400 h-full" style={{ width: `${totalTasks ? (todoTasksCount / totalTasks) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>In Progress</span>
                    <span>{inProgressTasksCount}</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${totalTasks ? (inProgressTasksCount / totalTasks) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Done</span>
                    <span>{doneTasksCount}</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: `${totalTasks ? (doneTasksCount / totalTasks) * 100 : 0}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overdue Team Tasks</CardTitle>
                <CardDescription>Immediate action required</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueTasks.length > 0 ? (
                    overdueTasks.slice(0, 5).map((t) => (
                      <div key={t._id} className="flex justify-between items-center text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{t.title}</p>
                          <p className="text-xs text-muted-foreground">Assignee: {t.assignee?.name || "Unassigned"}</p>
                        </div>
                        <span className="text-xs font-bold text-destructive">
                          Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground py-4 text-center">No overdue tasks!</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* MEMBER DASHBOARD WIDGETS */}
      {role === "member" && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">My Projects</CardTitle>
                <FolderKanban className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProjects}</div>
                <p className="text-xs text-muted-foreground">Projects you have joined</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
                <CheckSquare className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {inProgressTasksCount} in progress, {doneTasksCount} completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
                <AlertTriangle className="size-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
                <p className="text-xs text-muted-foreground">Personal tasks past due date</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>My Tasks Status</CardTitle>
                <CardDescription>Current workflow state for your assignments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Todo</span>
                    <span>{todoTasksCount}</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-zinc-400 h-full" style={{ width: `${totalTasks ? (todoTasksCount / totalTasks) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>In Progress</span>
                    <span>{inProgressTasksCount}</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${totalTasks ? (inProgressTasksCount / totalTasks) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Done</span>
                    <span>{doneTasksCount}</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: `${totalTasks ? (doneTasksCount / totalTasks) * 100 : 0}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Tasks due in the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.length > 0 ? (
                    upcomingTasks.map((t) => (
                      <div key={t._id} className="flex justify-between items-center text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                        <span className="font-medium truncate">{t.title}</span>
                        <span className="text-xs text-muted-foreground font-semibold">
                          Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground py-4 text-center">No upcoming deadlines!</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
