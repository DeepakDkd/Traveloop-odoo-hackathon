import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      {children}
    </main>
  );
}
