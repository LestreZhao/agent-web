"use client";

import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { Button } from "./ui/button";

const SIDEBAR_WIDTH = "19rem";
const SIDEBAR_BACKGROUND_COLOR = "#ebebeb";
export function AppSidebar() {
  return (
    <div
      className="flex h-full flex-col overflow-hidden p-2"
      style={{
        width: SIDEBAR_WIDTH,
        backgroundColor: SIDEBAR_BACKGROUND_COLOR,
      }}
    >
      {/* 顶部 */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex h-14 items-center gap-2">
        <motion.button className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-background/80 px-4 text-sm font-medium shadow-sm hover:bg-accent">
          <Plus className="h-4 w-4" />
          <span>新建任务</span>
        </motion.button>
      </div>
    </div>
  );
}

function SidebarItem({
  info,
}: {
  info: {
    name: string;
    icon: React.ReactNode;
    description: string;
  };
}) {
  return (
    <div>
      <div className="h-5 w-5 bg-[#dddddc]">{info.icon}</div>
      <div>
        <h3>{info.name}</h3>
        <p>{info.description}</p>
      </div>
    </div>
  );
}
