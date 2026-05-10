"use client";

import Link from "next/link";
import { Bell, Menu, Plane } from "lucide-react";

type AppHeaderProps = {
  onToggleDesktopSidebar?: () => void;
  onToggleMobileSidebar?: () => void;
};

export function AppHeader({
  onToggleDesktopSidebar,
  onToggleMobileSidebar,
}: AppHeaderProps) {
  const showSidebarToggle =
    typeof onToggleDesktopSidebar === "function" &&
    typeof onToggleMobileSidebar === "function";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {showSidebarToggle ? (
            <>
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                className="app-icon-button inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 text-[#1a1a2e] lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu size={18} />
              </button>
              <button
                type="button"
                onClick={onToggleDesktopSidebar}
                className="app-icon-button hidden h-10 w-10 items-center justify-center rounded-xl border border-black/10 text-[#1a1a2e] lg:inline-flex"
                aria-label="Toggle sidebar"
              >
                <Menu size={18} />
              </button>
            </>
          ) : null}

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d6e6e] text-white shadow-sm">
              <Plane size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0d6e6e]">
              Traveloop
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="app-icon-button inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 text-[#6b7280]"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
          <Link
            href="/login"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#3d52a0] to-[#0d6e6e] text-sm font-semibold text-white shadow-sm"
            aria-label="Go to login page"
          >
            TL
          </Link>
        </div>
      </div>
    </header>
  );
}
