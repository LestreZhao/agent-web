"use client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { parse } from "best-effort-json-parser";
import { motion } from "framer-motion";
import {
  Atom,
  Check,
  ChevronDown,
  ChevronUp,
  Database,
  DatabaseBackup,
  ListTodo,
  LoaderIcon,
  Search,
  TextSearch,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Markdown } from "~/app/_components/Markdown";
import { useTaskStore } from "~/core/store/task";
import { useUIStore } from "~/core/store/ui";
import { cn } from "~/core/utils";
import { type ThinkingTask, type Workflow } from "~/core/workflow";

export function WorkflowProgressView({
  className,
  workflow,
  loading,
}: {
  className?: string;
  workflow: Workflow;
  loading: boolean;
}) {
  const { currentStepInfo } = useTaskStore();
  const steps = useMemo(() => {
    return workflow.steps.filter((step) => step.agentName !== "reporter");
  }, [workflow]);
  const reportStep = useMemo(() => {
    return workflow.steps.find((step) => step.agentName === "reporter");
  }, [workflow]);
  return (
    <div className="flex w-full flex-col gap-2">
      <div className={cn("flex overflow-hidden rounded-2xl", className)}>
        <main className="flex-grow overflow-auto">
          <ul className="">
            {steps.map((step, index) =>
              step.agentName === "planner" ? (
                step.tasks &&
                step.tasks.length > 0 && (
                  <PlanTaskView key={step.agentId} task={step.tasks[0]!} />
                )
              ) : (
                <StepView
                  key={step.id}
                  loading={loading}
                  step={{ ...step, index }}
                  currentStep={currentStepInfo}
                />
              ),
            )}
          </ul>
        </main>
      </div>
      {reportStep && (
        <div className="flex flex-col gap-4 p-4">
          <Markdown>
            {reportStep.tasks[0]?.type === "thinking"
              ? reportStep.tasks[0].payload.text
              : ""}
          </Markdown>
        </div>
      )}
    </div>
  );
}

function PlanTaskView({ task }: { task: ThinkingTask }) {
  const { setSelectedTask } = useTaskStore();
  const plan = useMemo<{
    title?: string;
    steps?: { title?: string; description?: string }[];
  }>(() => {
    if (task.payload.text && task.state === "success") {
      return parse(
        task.payload.text.replace(/```json/g, "").replace(/```/g, ""),
      );
    }
    return {};
  }, [task]);

  const thought = ` ${plan.thought ?? ""} `;
  return (
    <div key={task.id} className="flex flex-col">
      {thought && (
        <div>
          <Markdown>{thought}</Markdown>
        </div>
      )}
      <TaskView
        task={task}
        key={task.id}
        title={
          task.state === "success"
            ? "任务计划已生成"
            : "正在分析用户需求,生成执行计划…"
        }
        setSelectedTask={setSelectedTask}
        icon={<ListTodo className="mr-2 h-4 w-4" />}
      />
    </div>
  );
}

function StepView({
  step,
  currentStep,
  loading,
}: {
  step: any;
  currentStep: any;
  loading: boolean;
}) {
  const { setSelectedTask } = useTaskStore();
  const stepName = step.step_info?.title;
  const tasks = step.tasks.filter((task) => {
    if (task.type === "thinking") {
      return task.payload.text?.length > 0;
    } else {
      return task;
    }
  });
  const [open, setOpen] = useState(true);
  return (
    <motion.div className="mb-2 flex gap-x-2">
      {currentStep?.step_index === step.index && loading ? (
        <div className="relative flex justify-center">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#b9b9b7] text-white">
            <LoaderIcon size={12} className="animate-spin" />
          </div>
        </div>
      ) : (
        <div className="relative flex justify-center">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#b9b9b7] text-white">
            <Check size={12} />
          </div>
          {currentStep?.total_steps > step.index && (
            <div
              className={cn(
                "absolute bottom-0 top-4 h-full border-l border-dashed border-[#b9b9b7]",
              )}
            ></div>
          )}
        </div>
      )}
      <Collapsible onOpenChange={setOpen} open={open}>
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center gap-2">
            <motion.span
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-bold"
            >
              {stepName}
            </motion.span>
            {open ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {tasks.map((task) => {
            return (
              <TaskView
                key={task.id}
                task={task}
                title={getStepName(task).title}
                setSelectedTask={setSelectedTask}
                icon={getStepName(task).icon}
              />
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}

export function TaskView({
  task,
  title,
  icon,
  setSelectedTask,
}: {
  task?: any;
  title?: string;
  icon?: React.ReactNode;
  setSelectedTask?: (task: any) => void;
}) {
  const { setExpandTaskView } = useUIStore();
  const { setIsSelectedTask } = useTaskStore();
  return (
    <motion.div className="flex items-center justify-between">
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        onClick={() => {
          setExpandTaskView?.(true);
          setIsSelectedTask(true);
          setSelectedTask?.({ ...task, taskTitle: title, icon });
        }}
        className="my-2 flex cursor-pointer items-center overflow-hidden rounded-full border bg-[#37352f0a] px-2.5 py-1.5"
      >
        {icon}
        <motion.span className="ml-2 line-clamp-1 text-xs">{title}</motion.span>
      </motion.div>
      <div></div>
    </motion.div>
  );
}

export function getStepName(task: any) {
  let taskInfo = {};
  switch (task.type) {
    case "thinking":
      taskInfo = {
        title: "正在分析数据内容…",
        icon: <Atom className="h-4 w-4" />,
      };
      return taskInfo;
    case "tool_call":
      if (task.payload.toolName === "tavily_search") {
        taskInfo = {
          title: `正在检索 ${task.payload.input.query}`,
          icon: <Search className="h-4 w-4 shrink-0 text-sm" />,
        };
      }
      if (task.payload.toolName === "crawl_tool") {
        taskInfo = {
          title: `正在浏览网页 ${task.payload.input.url}`,
          // title: `正在浏览网页…`,
          icon: <TextSearch className="h-4 w-4 shrink-0 text-sm" />,
        };
      }
      if (task.payload.toolName === "get_table_info") {
        taskInfo = {
          // title: `正在查询数据库 ${task.payload.input.table_name ?? ""}`,
          title: `正在查询数据库…`,
          icon: <Database className="h-4 w-4 shrink-0 text-sm" />,
        };
      }
      if (task.payload.toolName === "get_table_relationships") {
        taskInfo = {
          // title: `正在查询表关系 ${task.payload.input.table_name ?? ""}`,
          title: `正在查询表关系…`,
          icon: <Database className="h-4 w-4 shrink-0 text-sm" />,
        };
      }
      if (task.payload.toolName === "execute_oracle_query") {
        taskInfo = {
          // title: `正在执行数据库命令 ${task.payload.input.sql ?? ""}`,
          title: `正在执行数据库命令…`,
          icon: <DatabaseBackup className="h-4 w-4 shrink-0 text-sm" />,
        };
      }
      return taskInfo;
    case "planner":
      taskInfo = {
        title: "正在规划",
        icon: <Search className="h-4 w-4 shrink-0 text-sm" />,
      };
      return taskInfo;
    case "researcher":
      taskInfo = {
        title: "正在研究",
        icon: <Search className="h-4 w-4 shrink-0 text-sm" />,
      };
      return taskInfo;
    case "supervisor":
      taskInfo = {
        title: "正在思考",
        icon: <Search className="h-4 w-4 shrink-0 text-sm" />,
      };
      return taskInfo;
    case "reporter":
      taskInfo = {
        title: "正在总结",
        icon: <Search className="h-4 w-4 shrink-0 text-sm" />,
      };
      return taskInfo;
  }
}
