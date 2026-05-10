import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ className, label, error, ...props }: InputProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label className="text-[14px] font-medium text-[#1a1a2e]">
          {label}
        </label>
      ) : null}

      <input
        className={cn(
          "h-10 w-full rounded-[0.5rem] border border-black/10 bg-white px-3 text-[14px] text-[#1a1a2e] placeholder:text-[#6b7280] transition-all duration-200 focus:border-[#0d6e6e] focus:outline-none focus:ring-2 focus:ring-[#0d6e6e]/20",
          error && "border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]/20",
          className,
        )}
        {...props}
      />

      {error ? <span className="text-[12px] text-[#ef4444]">{error}</span> : null}
    </div>
  );
}
