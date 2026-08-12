"use client";

import React, { useState } from "react";
import { RoleGuard } from "@/components/layout/role-guard";
import { useAuditLogs, AuditLog } from "@/hooks/use-audit-logs";
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
import { Card, CardContent } from "@/components/ui/card";

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  // Filter States
  const [actorFilter, setActorFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState("");

  const filters = {
    actor: actorFilter || undefined,
    action: actionFilter || undefined,
    targetType: targetTypeFilter || undefined,
  };

  const { data, isLoading } = useAuditLogs(page, limit, filters);

  const logs = data?.auditLogs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">
            System-wide log entries tracking mutations and administrative events.
          </p>
        </div>

        {/* Filters bar */}
        <Card>
          <CardContent className="p-4 flex flex-wrap gap-4 items-end">
            <div className="w-[180px] space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Actor User ID</label>
              <Input
                placeholder="Search Actor ID..."
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
              />
            </div>

            <div className="w-[180px] space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Action Type</label>
              <select
                className="w-full rounded-lg border border-input bg-card p-2 text-sm"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="">All Actions</option>
                <option value="USER_CREATED">User Created</option>
                <option value="USER_ROLE_CHANGED">User Role Changed</option>
                <option value="USER_DEACTIVATED">User Deactivated</option>
                <option value="PROJECT_CREATED">Project Created</option>
                <option value="PROJECT_UPDATED">Project Updated</option>
                <option value="PROJECT_DELETED">Project Deleted</option>
                <option value="TASK_CREATED">Task Created</option>
                <option value="TASK_UPDATED">Task Updated</option>
                <option value="TASK_DELETED">Task Deleted</option>
                <option value="TASK_STATUS_CHANGED">Task Status Changed</option>
              </select>
            </div>

            <div className="w-[180px] space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Target Type</label>
              <select
                className="w-full rounded-lg border border-input bg-card p-2 text-sm"
                value={targetTypeFilter}
                onChange={(e) => setTargetTypeFilter(e.target.value)}
              >
                <option value="">All Targets</option>
                <option value="User">User</option>
                <option value="Project">Project</option>
                <option value="Task">Task</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target Type</TableHead>
                    <TableHead>Target ID</TableHead>
                    <TableHead>Metadata</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, r) => (
                    <TableRow key={r}>
                      {Array.from({ length: 6 }).map((_, c) => (
                        <TableCell key={c}>
                          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : logs.length === 0 ? (
              <div className="py-24 text-center text-sm text-muted-foreground">
                No logs found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target Type</TableHead>
                    <TableHead>Target ID</TableHead>
                    <TableHead>Metadata</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: AuditLog) => (
                    <TableRow key={log._id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{log.actor?.name || "System"}</span>
                          <span className="text-[10px] text-muted-foreground">{log.actor?._id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize font-semibold text-xs border border-border px-2 py-0.5 rounded bg-muted/50">
                          {log.action.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>{log.targetType}</TableCell>
                      <TableCell className="font-mono text-xs">{log.targetId}</TableCell>
                      <TableCell className="max-w-[250px] truncate text-xs font-mono">
                        {log.metadata ? JSON.stringify(log.metadata) : "N/A"}
                      </TableCell>
                      <TableCell>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
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
    </RoleGuard>
  );
}
