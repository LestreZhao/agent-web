"use client";

import { motion } from "framer-motion";

import "~/styles/globals.css";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative h-screen w-full">
      <div className="absolute inset-0 bg-[url('/images/login-bg.png')] bg-cover bg-center bg-no-repeat" />
      <div className="absolute inset-0 bg-white/60" />
      <div className="relative flex h-screen w-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid h-[600px] w-[60%] w-[90%] grid-cols-5 overflow-hidden rounded-xl bg-white/50 md:w-[60%]"
        >
          <div className="col-span-3 col-span-5 flex items-center justify-center p-4 py-8 md:col-span-3">
            {children}
          </div>
          <div className="col-span-2 hidden flex-col items-center justify-center space-y-10 bg-white/50 md:flex">
            <img src="/images/fusion-ai.png" className="h-10" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
