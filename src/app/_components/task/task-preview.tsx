"use client";

import { motion } from "framer-motion";
import {
  Atom,
  Check,
  ChevronDown,
  LoaderCircle,
  Maximize2,
  Play,
} from "lucide-react";
import { useMemo, useState } from "react";

import { getStepName } from "~/app/_components/messages/messages-task-view";
import { TaskToolResultView } from "~/app/_components/task/task-tool-result";
import { Button } from "~/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { useTaskStore } from "~/core/store/task";
import { cn } from "~/core/utils";

import { TaskTag } from "./task-tag";

interface TaskItem {
  text: string;
  completed: boolean;
}

// 任务预览 （左侧及消息底部）
export default function TaskPreview({
  tasks,
  className,
  expand,
  setExpand,
  responding,
}: {
  tasks: TaskItem[];
  className?: string;
  expand?: boolean;
  responding: boolean;
  setExpand?: (expand: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleExpanded = () => {
    setCollapsed(!collapsed);
  };

  const {
    selectedTask,
    currentStepInfo,
    isSelectedTask,
    currentTask,
    setIsSelectedTask,
  } = useTaskStore();

  const task = useMemo(() => {
    return isSelectedTask ? selectedTask : currentTask;
  }, [selectedTask, currentTask, isSelectedTask]);
  const stepInfo = useMemo(() => {
    return currentStepInfo;
  }, [currentStepInfo]);

  return (
    <div className={expand ? "h-full p-3 pb-4" : "h-full"}>
      <motion.div
        className={cn(
          `relative mb-2 flex flex-col border border-[#E5E5E5] bg-white ${
            expand ? "rounded-3xl p-4" : "rounded-xl p-2"
          }`,
          collapsed && "p-2",
          className,
        )}
      >
        {
          <div
            className={cn(
              expand ? "flex-col" : "",
              !expand && !collapsed
                ? "absolute bottom-2.5 left-2.5 z-50"
                : "relative flex flex-1 gap-4",
            )}
          >
            <div
              className={cn(
                "flex flex-col",
                expand ? "" : "flex-1",
                !expand && !collapsed ? "hidden" : "",
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold">Fusion AI 的计算机</h2>
                {expand ? (
                  <button
                    onClick={() => setExpand?.(!expand)}
                    className="rounded-full p-1 hover:bg-gray-100"
                  >
                    <Maximize2 size={18} className="text-[#858481]" />
                  </button>
                ) : (
                  <button
                    onClick={() => setCollapsed?.(!collapsed)}
                    className="rounded-full p-1 hover:bg-gray-100"
                  >
                    <ChevronDown size={18} className="text-[#858481]" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#f7f7f7]">
                  {task ? getStepName(task).icon : <Atom size={20} />}
                </div> */}
                <div>
                  {/* <span className="text-xs text-[#858481]">
                    Fusion AI 正在执行任务
                  </span> */}
                  {expand && (
                    <TaskTag
                      task={task}
                      key={task.text}
                      title={getStepName(task).title}
                      icon={getStepName(task).icon}
                    />
                  )}
                </div>
              </div>
            </div>
            <div
              className={
                expand
                  ? "mb-14 flex-1"
                  : "bg-menu-white group bottom-[7px] start-3 order-[-1] h-[38px] w-[56px] cursor-pointer overflow-hidden rounded-lg border shadow-lg backdrop-blur-[40px] transition-transform hover:scale-[1.03] sm:h-[68px] sm:w-[100px]"
              }
            >
              <div
                className={cn(
                  expand
                    ? "h-full"
                    : "pointer-events-none flex h-[284px] w-[355px] origin-[0_0] scale-x-[0.157] scale-y-[0.248] flex-col overflow-hidden rounded-lg border border-[var(--border-dark)] bg-[var(--background-gray-main)] shadow-[0px_4px_32px_0px_rgba(0,0,0,0.04)] dark:border-black/30 sm:scale-x-[0.282] sm:scale-y-[0.242] rtl:origin-[100%_0]",
                )}
              >
                <TaskContentView
                  task={task}
                  isSelectedTask={isSelectedTask}
                  setIsSelectedTask={setIsSelectedTask}
                />
              </div>
              <div className="absolute bottom-1 right-1 flex h-[16px] w-[16px] items-center justify-center rounded-sm bg-[var(--fill-black)] opacity-0 transition-opacity group-hover:opacity-100 sm:h-[28px] sm:w-[28px] sm:rounded-lg">
                <button
                  className="rounded-lg bg-[#28282973] p-1"
                  onClick={() => setExpand?.(true)}
                >
                  <Maximize2 size={18} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        }
        <motion.div
          className={
            expand
              ? "absolute bottom-4 left-0 right-0 z-50 mx-4 rounded-lg"
              : ""
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {collapsed ? (
            <div
              className={cn(
                "mt-2 w-full rounded-lg p-4 pt-0",
                expand && collapsed
                  ? "border border-[#E5E5E5] bg-white"
                  : "bg-[#F8F8F7]",
              )}
            >
              <h3 className="flex items-center justify-between text-sm font-bold">
                任务进度
                <div className="mt-4 flex items-center">
                  <div className="float-right cursor-pointer text-xs font-normal text-gray-400">
                    {stepInfo?.step_index} / {stepInfo?.total_steps}
                  </div>
                  {!expand && collapsed ? null : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full p-1"
                      onClick={toggleExpanded}
                    >
                      <ChevronDown size={20} />
                    </Button>
                  )}
                </div>
              </h3>
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mr-2.5 flex h-5 w-5 items-center justify-center">
                      {stepInfo?.step_index > index + 1 && (
                        <Check size={20} className="text-green-500" />
                      )}
                      {stepInfo?.step_index === index + 1 && (
                        <LoaderCircle
                          size={20}
                          className="animate-spin text-[#858481]"
                        />
                      )}
                    </div>
                    <p className="flex-1 text-sm">{task.title}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "flex items-center justify-between rounded-lg",
                expand && !collapsed ? "border border-[#E5E5E5] p-2" : "",
              )}
              onClick={toggleExpanded}
            >
              <div
                className={cn(
                  "flex items-start",
                  !expand && !collapsed ? "ml-[120px]" : "",
                )}
              >
                <div className="mr-3 text-green-500">
                  {stepInfo?.step_index === stepInfo?.total_steps ||
                    (!responding && (
                      <Check size={20} className="text-green-500" />
                    ))}
                  {stepInfo?.step_index < stepInfo?.total_steps &&
                    responding && (
                      <LoaderCircle
                        size={20}
                        className="animate-spin text-[#858481]"
                      />
                    )}
                </div>
                <h3 className="text-sm font-medium">
                  {stepInfo?.step_info?.title}
                </h3>
              </div>
              <div className="flex items-center text-gray-400">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="float-right cursor-pointer text-xs font-normal text-gray-400"
                >
                  {stepInfo?.step_index} / {stepInfo?.total_steps}
                </motion.span>
                {!expand && <ChevronDown size={20} className="ml-2" />}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

// 任务内容视图
function TaskContentView({
  task,
  isSelectedTask,
  setIsSelectedTask,
}: {
  task: TaskItem;
  isSelectedTask: boolean;
  setIsSelectedTask: (isSelectedTask: boolean) => void;
}) {
  if (!task) {
    return null;
  }
  return (
    <ResizablePanelGroup
      direction="vertical"
      className="relative h-full max-w-full rounded-lg border bg-[#f8f8f7]"
    >
      <ResizablePanel defaultSize={6}>
        <div className="flex h-full items-center justify-center text-sm font-bold text-[#858481]">
          {getStepName(task).typeName}
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel
        defaultSize={94}
        style={{
          overflowY: "scroll",
          padding: "10px",
        }}
      >
        <TaskToolResultView task={task} />
        {isSelectedTask && (
          <motion.div className="absolute bottom-4 left-0 right-0 flex w-full justify-center">
            <motion.button
              className="flex h-10 items-center justify-center gap-2 rounded-3xl border-[#E5E5E5] bg-white px-4 text-sm font-medium shadow-lg hover:border hover:bg-accent"
              onClick={() => setIsSelectedTask(false)}
            >
              <Play className="h-4 w-4" />
              <span>跳到实时</span>
            </motion.button>
          </motion.div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
