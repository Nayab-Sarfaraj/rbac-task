"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { Menu, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  onOpenSidebar: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/85 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenSidebar}
        >
          <Menu className="size-5" />
        </Button>
        <h1 className="text-md font-semibold text-foreground hidden sm:block">
          Project & Task Management
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-muted border border-border">
            <UserIcon className="size-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-medium text-foreground">{user?.name}</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
