"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="app-shell bg-[#f8f9fa] text-[#1a1a2e]">
      <AppHeader
        onToggleDesktopSidebar={() =>
          setIsDesktopSidebarOpen((current) => !current)
        }
        onToggleMobileSidebar={() =>
          setIsMobileSidebarOpen((current) => !current)
        }
      />

      <AppSidebar
        isDesktopOpen={isDesktopSidebarOpen}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <main
        className={cn(
          "min-h-screen pt-16 transition-[padding] duration-300",
          isDesktopSidebarOpen ? "lg:pl-72" : "lg:pl-0",
        )}
      >
        {children}
      </main>
    </div>
  );
}
