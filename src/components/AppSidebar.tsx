"use client";

import { motion } from "framer-motion";
import { ClipboardList, PanelLeft, Plus } from "lucide-react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";

import { messagesList } from "~/app/(chat)/[id]/mock";
import {
  clearMessages,
  setChatId,
  setMessages,
  useMessageStore,
} from "~/core/store/message";
import { useUIStore } from "~/core/store/ui";
import { cn } from "~/core/utils";

import { TooltipButton } from "./ui/tooltip-button";
import { useTaskStore } from "~/core/store/task";

const SIDEBAR_WIDTH = "19rem";
const SIDEBAR_BACKGROUND_COLOR = "#ebebeb";

export function AppSidebar({ className }: { className?: string }) {
  const router = useRouter();
  const { isFloatingSidebar, setIsFloatingSidebar, setExpandTaskView } =
    useUIStore();
  const { setCurrentStepInfo, setIsSelectedTask } = useTaskStore();
  // const historyList = useMessageStore((state) => state.historyList);
  const historyList = messagesList;
  const chatId = useMessageStore((state) => state.chatId);
  const handleNewTask = () => {
    clearMessages();
    setExpandTaskView(false);
    setChatId(nanoid());
    router.push(`/`);
  };

  const handleTaskClick = (id: string) => {
    setChatId(id);
    const task = messagesList.find((item) => item.id === id);
    if (task) {
      const lastMessage = task.messages[task.messages.length - 1];
      setMessages(task.messages as Message[]);
      setCurrentStepInfo(
        lastMessage?.content?.workflow?.steps[
          lastMessage.content.workflow.steps.length - 1
        ],
      );
      // 关闭任务视图
      setExpandTaskView(false);
      // 关闭任务选择
      setIsSelectedTask(false);
      router.push(`/${id}`);
    }
  };

  return (
    <div
      className={cn(
        className,
        isFloatingSidebar ? "z-[9999] p-2" : "z-[100]",
        "h-full",
      )}
      style={{
        width: SIDEBAR_WIDTH,
        willChange: "transform",
      }}
    >
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden p-2",
          isFloatingSidebar
            ? "rounded-lg border bg-white/80 shadow-lg backdrop-blur-sm"
            : "",
        )}
        style={{
          width: SIDEBAR_WIDTH,
          backgroundColor: SIDEBAR_BACKGROUND_COLOR,
          willChange: "transform",
        }}
      >
        {/* 顶部 */}
        <div className="flex items-center justify-between gap-2">
          <TooltipButton
            tooltip={isFloatingSidebar ? "停靠" : "取消停靠"}
            tooltipSide="top"
            tooltipAlign="center"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setIsFloatingSidebar(!isFloatingSidebar)}
          >
            <PanelLeft className="h-5 w-5" />
          </TooltipButton>
        </div>
        <div className="flex h-14 items-center gap-2">
          <motion.button
            className="mx-2 flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-background/80 px-4 text-sm font-medium shadow-sm hover:bg-accent"
            onClick={handleNewTask}
          >
            <Plus className="h-4 w-4" />
            <span>新建任务</span>
          </motion.button>
        </div>
        <div className="flex flex-col gap-2">
          {historyList.map((item) => (
            <SidebarItem
              key={item.id}
              isSelected={item.id === chatId}
              info={item}
              handleClickItem={() => handleTaskClick(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  isSelected,
  info,
  handleClickItem,
}: {
  isSelected: boolean;
  handleClickItem: () => void;
  info: {
    id: string;
    title: string;
    icon: React.ReactNode;
    description: string;
  };
}) {
  return (
    <motion.div
      className={cn(
        "flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg p-2 text-sm font-medium hover:bg-[#e4e4e4]",
        isSelected ? "bg-white shadow-sm" : "",
      )}
      onClick={handleClickItem}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isSelected ? "bg-[#34322e] text-white" : "bg-[#dddddc]",
        )}
      >
        {info.icon ?? <ClipboardList className="h-5 w-5" />}
      </div>
      <div>
        <h3 className="line-clamp-1 text-sm font-medium">{info.title}</h3>
        <p className="line-clamp-1 text-xs text-[#858481]">
          {info.description}
        </p>
      </div>
      <div className="flex h-full flex-col items-end justify-start text-xs text-[#858481]">
        12:30
      </div>
    </motion.div>
  );
}
