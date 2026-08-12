"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { RoleGuard } from "@/components/layout/role-guard";
import {
  useUsers,
  useUpdateUserRole,
  useDeactivateUser,
  User,
} from "@/hooks/use-users";
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
import { Search, UserMinus } from "lucide-react";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 10;

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const filters = {
    search: search || undefined,
    role: roleFilter || undefined,
  };

  const { data, isLoading } = useUsers(page, limit, filters);
  const updateRoleMutation = useUpdateUserRole();
  const deactivateUserMutation = useDeactivateUser();

  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateRoleMutation.mutateAsync({ id: userId, role: newRole });
  };

  const handleDeactivate = async (userId: string) => {
    if (confirm("Are you sure you want to deactivate this user? This will soft-delete their profile.")) {
      await deactivateUserMutation.mutateAsync(userId);
    }
  };

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage system users, change roles, and deactivate accounts.
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
                  placeholder="Search by name or email..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="w-[180px] space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Filter by Role</label>
              <select
                className="w-full rounded-lg border border-input bg-card p-2 text-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="member">Member</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
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
            ) : users.length === 0 ? (
              <div className="py-24 text-center text-sm text-muted-foreground">
                No users found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: User) => {
                    const isSelf = user._id === currentUser?.id;

                    return (
                      <TableRow key={user._id}>
                        <TableCell className="font-semibold">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <select
                            className="rounded border border-input bg-card p-1 text-xs font-medium"
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            disabled={isSelf}
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="member">Member</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          {user.isDeleted ? (
                            <span className="text-xs font-semibold text-destructive">Deactivated</span>
                          ) : (
                            <span className="text-xs font-semibold text-green-600">Active</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            gap-1
                            disabled={isSelf || user.isDeleted}
                            onClick={() => handleDeactivate(user._id)}
                          >
                            <UserMinus className="size-4" />
                            Deactivate
                          </Button>
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
    </RoleGuard>
  );
}
