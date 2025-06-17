"use client";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { PanelLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppSidebar } from "~/components/AppSidebar";
import { useUIStore } from "~/core/store/ui";
import { cn } from "~/core/utils";

import "~/styles/globals.css";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isFloatingSidebar,
    expandSidebar,
    setExpandSidebar,
    setIsFloatingSidebar,
  } = useUIStore();

  useEffect(() => {
    if (pathname === "/chat" && !Cookies.get("is_invited")) {
      router.push("/");
    }
  }, [pathname, router]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div
        className={cn(
          "absolute inset-y-0 left-0",
          "transform transition-transform duration-200 ease-in-out",
          expandSidebar ? "translate-x-0" : "-translate-x-full",
          isFloatingSidebar ? "z-50" : "z-30",
        )}
        onMouseLeave={() => {
          if (isFloatingSidebar) {
            setExpandSidebar(false);
          }
        }}
      >
        <AppSidebar />
      </div>

      <motion.div
        whileHover={{ scale: 1.1 }}
        className={cn(
          "absolute left-2 top-2 z-40",
          "cursor-pointer rounded-full p-2 transition-opacity duration-200 ease-in-out",
          expandSidebar ? "pointer-events-none opacity-0" : "opacity-100",
        )}
        onMouseEnter={() => {
          setExpandSidebar(true);
          setIsFloatingSidebar(true);
        }}
      >
        <PanelLeft size={20} />
      </motion.div>

      <main
        className={cn(
          "h-full transition-[margin] duration-200 ease-in-out",
          expandSidebar && !isFloatingSidebar ? "ml-[19rem]" : "ml-0",
        )}
      >
        {children}
      </main>
    </div>
  );
}
