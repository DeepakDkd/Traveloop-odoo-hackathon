import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "ongoing" | "upcoming" | "completed" | "default";
};

const badgeVariants = {
  ongoing: "bg-[#dbeafe] text-[#1d4ed8]",
  upcoming: "bg-[#fef3c7] text-[#92400e]",
  completed: "bg-[#d1fae5] text-[#047857]",
  default: "bg-[#e5e7eb] text-[#4b5563]",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[12px] font-semibold",
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
