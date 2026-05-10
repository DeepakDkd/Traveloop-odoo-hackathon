import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="app-shell bg-[#f8f9fa] text-[#1a1a2e]">
      <AppHeader />
      <main className="flex min-h-screen items-center justify-center px-4 py-10 pt-24 sm:px-6">
        {children}
      </main>
    </div>
  );
}
