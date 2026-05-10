import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-[#f59e0b] text-[#1a1a2e] hover:bg-[#e58e0a] active:bg-[#d97f09] shadow-sm",
    secondary:
      "border-2 border-[#0d6e6e] text-[#0d6e6e] bg-transparent hover:bg-[#0d6e6e]/5 active:bg-[#0d6e6e]/10",
    outline:
      "border border-black/15 bg-white text-[#1a1a2e] hover:bg-[#f8f9fa] active:bg-[#e5e7eb]",
    ghost: "text-[#1a1a2e] hover:bg-[#e5e7eb] active:bg-[#e5e7eb]/80",
    destructive:
      "bg-[#ef4444] text-white hover:bg-[#dc2626] active:bg-[#b91c1c] shadow-sm",
  };

  const sizes = {
    sm: "h-8 px-3 text-[12px]",
    md: "h-10 px-4 text-[14px]",
    lg: "h-12 px-6 text-[14px]",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
