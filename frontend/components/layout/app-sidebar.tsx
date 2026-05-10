"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { sidebarSections } from "./navigation";

type AppSidebarProps = {
  isDesktopOpen: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
};

export function AppSidebar({
  isDesktopOpen,
  isMobileOpen,
  onCloseMobile,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar overlay"
        onClick={onCloseMobile}
        className={cn(
          "fixed inset-0 top-16 z-30 bg-[#1a1a2e]/28 transition-opacity lg:hidden",
          isMobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-72 flex-col border-r border-black/10 bg-white transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          isDesktopOpen ? "lg:translate-x-0" : "lg:-translate-x-full",
        )}
      >
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-6">
            {sidebarSections.map((section) => (
              <section key={section.title}>
                <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                  {section.title}
                </p>

                <div className="mt-3 space-y-1.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    if (item.disabled) {
                      return (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#9ca3af]"
                        >
                          <Icon size={18} />
                          <span>{item.label}</span>
                          <span className="ml-auto rounded-full bg-[#f3f4f6] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
                            Soon
                          </span>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onCloseMobile}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-[#0d6e6e] text-white shadow-sm"
                            : "text-[#1a1a2e] hover:bg-[#e5e7eb]",
                        )}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
