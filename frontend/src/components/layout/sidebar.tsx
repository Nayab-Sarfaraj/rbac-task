"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users as UsersIcon,
  FileClock,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "member"] },
    { href: "/projects", label: "Projects", icon: FolderKanban, roles: ["admin", "manager", "member"] },
    { href: "/tasks", label: "Tasks", icon: CheckSquare, roles: ["admin", "manager", "member"] },
    { href: "/users", label: "Users", icon: UsersIcon, roles: ["admin"] },
    { href: "/audit-logs", label: "Audit Logs", icon: FileClock, roles: ["admin"] },
  ];

  const visibleLinks = links.filter((link) =>
    user ? link.roles.includes(user.role) : false
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card px-4 py-6 transition-transform lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-2 mb-8">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <span className="text-lg font-bold tracking-tight text-foreground">
              RBAC Tracker
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border pt-4 mt-auto">
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {user?.name}
              </span>
              <span className="text-xs text-muted-foreground truncate uppercase font-semibold">
                {user?.role}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
