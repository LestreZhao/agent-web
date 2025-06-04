"use client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { parse } from "best-effort-json-parser";
import { motion } from "framer-motion";
import { Atom, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Markdown } from "~/app/_components/Markdown";
import { useTaskStore } from "~/core/store/task";
import { useUIStore } from "~/core/store/ui";
import { cn } from "~/core/utils";
import { type ThinkingTask, type Workflow } from "~/core/workflow";

export function WorkflowProgressView({
  className,
  workflow,
}: {
  className?: string;
  workflow: Workflow;
}) {
  const steps = useMemo(() => {
    return workflow.steps.filter((step) => step.agentName !== "reporter");
  }, [workflow]);
  const reportStep = useMemo(() => {
    return workflow.steps.find((step) => step.agentName === "reporter");
  }, [workflow]);
  return (
    <div className="flex w-full flex-col gap-2">
      <div className={cn("flex overflow-hidden rounded-2xl", className)}>
        <main className="flex-grow overflow-auto p-4">
          <ul className="">
            {steps.map((step) =>
              step.agentName === "planner" ? (
                step.tasks &&
                step.tasks.length > 0 && (
                  <PlanTaskView key={step.agentId} task={step.tasks[0]!} />
                )
              ) : (
                <StepView key={step.id} step={step} />
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
    if (task.payload.text) {
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
            : "正在分析数据内容,生成执行计划…"
        }
        setSelectedTask={setSelectedTask}
        icon={<Atom className="mr-2 h-4 w-4" />}
      />
    </div>
  );
}

function StepView({ step }: { step: any }) {
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
    <motion.div className="">
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
                title={getStepName(task)}
                setSelectedTask={setSelectedTask}
                icon={<Search className="mr-2 h-4 w-4 shrink-0 text-sm" />}
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
  return (
    <motion.div className="flex items-center justify-between">
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        onClick={() => {
          setExpandTaskView?.(true);
          setSelectedTask?.({ ...task, taskTitle: title });
        }}
        className="my-2 flex cursor-pointer items-center overflow-hidden rounded-full border bg-[#37352f0a] px-2.5 py-1.5"
      >
        {icon}
        <motion.span className="line-clamp-1 text-xs">{title}</motion.span>
      </motion.div>
      <div></div>
    </motion.div>
  );
}

function getStepName(task: any) {
  switch (task.type) {
    case "thinking":
      return "正在分析数据内容…";
    case "tool_call":
      if (task.payload.toolName === "tavily_search") {
        return `正在检索 ${task.payload.input.query}`;
      }
      if (task.payload.toolName === "crawl_tool") {
        return `正在爬取 ${task.payload.input.url}`;
      }
      if (task.payload.toolName === "get_table_info") {
        return `正在查询数据表 ${task.payload.input.table_name || ""}`;
      }
      if (task.payload.toolName === "execute_oracle_query") {
        return `正在执行数据库命令 ${task.payload.input.sql || ""}`;
      }
      return "正在调用工具";
    case "planner":
      return "正在规划";
    case "researcher":
      return "正在研究";
    case "supervisor":
      return "正在思考";
    default:
      return task.type;
  }
}
