import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
};

export function Card({
  className,
  hover = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-black/10",
        hover &&
          "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
