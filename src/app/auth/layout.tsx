"use client";

import { AppHeader } from "~/components/AppHeader";
import { cn } from "~/core/utils";

import "~/styles/globals.css";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative min-h-screen justify-center bg-gray-50/50">
      <header className="absolute left-0 top-0 ml-6 flex w-full items-center pt-4">
        <AppHeader />
      </header>
      <main className={cn("h-full w-full")}>{children}</main>
    </div>
  );
}
