import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DashboardPageProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function DashboardPage({
  children,
  className,
  contentClassName,
}: DashboardPageProps) {
  return (
    <div className={cn("px-4 py-8 pb-24 sm:px-6 lg:px-8 lg:pb-10", className)}>
      <div className={cn("mx-auto w-full max-w-7xl", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
