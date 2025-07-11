"use client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { parse } from "best-effort-json-parser";
import { motion } from "framer-motion";
import {
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  Code,
  Database,
  DatabaseBackup,
  FileText,
  ListTodo,
  LoaderIcon,
  Monitor,
  Search,
  TextSearch,
  X,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { Markdown } from "~/components/comon/Markdown";
import { useTaskStore } from "~/core/store/task";
import { useUIStore } from "~/core/store/ui";
import { cn } from "~/core/utils";
import { type ThinkingTask, type Workflow } from "~/core/workflow";

import { ChatFilePreviewItem } from "../file-preview";
import { TaskTag } from "../task/task-tag";

// 消息任务视图
export function MessagesTaskView({
  className,
  workflow,
  loading,
}: {
  className?: string;
  workflow: Workflow;
  loading: boolean;
}) {
  // 当前步骤信息
  const { currentStepInfo, setSelectedTask, setIsSelectedTask } =
    useTaskStore();
  const { setExpandTaskView, setIsFilePreview } = useUIStore();

  // 步骤
  const steps = workflow?.steps
    ? workflow.steps.map((step) => {
        if (step.agentName === "reporter") {
          return {
            ...step,
            tasks: [],
          };
        }
        return step;
      })
    : [];
  // 总结
  const reportStep = workflow?.steps
    ? workflow.steps.find((step) => step.agentName === "reporter")
    : null;

  // 点击任务标签
  const handleTaskTagClick = (task: any) => {
    setSelectedTask?.(task);
    setExpandTaskView?.(true);
    setIsSelectedTask(true);
    setIsFilePreview(false);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className={cn("flex rounded-2xl", className)}>
        <main className="flex-grow">
          <ul className="">
            {steps.map((step, index) =>
              step.agentName === "planner" ? (
                step.tasks &&
                step.tasks.length > 0 && (
                  <PlanTaskView
                    key={step.agentId}
                    task={step.tasks[0]!}
                    handleClick={handleTaskTagClick}
                  />
                )
              ) : (
                <StepView
                  key={step.id}
                  loading={loading}
                  step={{ ...step, index }}
                  currentStep={currentStepInfo}
                  handleClick={handleTaskTagClick}
                />
              ),
            )}
          </ul>
        </main>
      </div>
      {reportStep && (
        <div className="flex flex-col gap-2 pt-[-10px]">
          {reportStep.tasks &&
            reportStep.tasks.length > 0 &&
            reportStep.tasks.map((task) => {
              if (task.type === "tool_call") {
                if (
                  task.payload.toolName === "get_task_files_json" &&
                  task.state === "success"
                ) {
                  const files = JSON.parse(task.payload.output ?? "[]");
                  return (
                    <div key={task.id}>
                      <div className="text-sm font-bold">创建的文件列表：</div>
                      <div className="flex flex-wrap gap-2">
                        {files.files.map((file) => {
                          return (
                            <ChatFilePreviewItem
                              key={file.name}
                              file={file}
                              canRemove={false}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <Markdown key={task.id}>{task.payload.output}</Markdown>
                  );
                }
              } else if (task.type === "thinking") {
                return <Markdown key={task.id}>{task.payload.text}</Markdown>;
              } else {
                return null;
              }
            })}
        </div>
      )}
    </div>
  );
}

// 计划任务视图
function PlanTaskView({
  task,
  handleClick,
}: {
  task: ThinkingTask;
  handleClick: (task: any) => void;
}) {
  const plan =
    task.payload.text && task.state === "success"
      ? parse(task.payload.text.replace(/```json/g, "").replace(/```/g, ""))
      : {};

  const thought = plan.thought ?? "";
  return (
    <div key={task.id} className="flex flex-col">
      {thought && (
        <div>
          <Markdown>{thought}</Markdown>
        </div>
      )}
      <TaskTag
        task={task}
        key={task.id}
        title={
          task.state === "success"
            ? "任务计划已生成"
            : "正在分析用户需求,生成执行计划…"
        }
        handleClick={handleClick}
        icon={<ListTodo className="mr-2 h-4 w-4" />}
      />
    </div>
  );
}

// 步骤视图
function StepView({
  step,
  currentStep,
  loading,
  handleClick,
}: {
  step: any;
  currentStep: any;
  loading: boolean;
  handleClick: (task: any) => void;
}) {
  const stepName = step.step_info?.title || "执行失败，当前步骤已重置";
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
            {!step.step_info?.title ? <X size={12} /> : <Check size={12} />}
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
            {currentStep?.total_steps !== step.index + 1 && (
              <>
                {open ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </>
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {tasks.map((task) => {
            const { title, icon } = getStepName(task) ?? {};
            return (
              <TaskTag
                key={task.id}
                task={task}
                title={title}
                icon={icon}
                handleClick={handleClick}
              />
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}

export function getStepName(task: any) {
  let taskInfo = {};
  switch (task.type) {
    case "thinking":
      taskInfo = {
        typeName: "FusionAI 正在分析",
        title: "正在分析数据内容…",
        icon: (
          <Image
            src="/icon.png"
            alt="FusionAI"
            width={16}
            height={16}
            className="h-4 w-4 shrink-0 rounded-full"
          />
        ),
      };
      if (task.agentName === "db_analyst") {
        taskInfo.title = "正在分析数据库查询结果…";
      }
      if (task.agentName === "researcher") {
        taskInfo.title = "正在分析网页信息…";
      }
      if (task.agentName === "chart_generator") {
        taskInfo.title = "正在生成可视化图表…";
      }
      if (task.agentName === "reporter") {
        taskInfo.title = "正在生成任务报告…";
      }
      return taskInfo;
    case "tool_call":
      if (task.payload.toolName === "tavily_search") {
        taskInfo = {
          typeName: "检索数据",
          title: `正在检索 ${task.payload.input.query}`,
          icon: <Search className="h-4 w-4 shrink-0 text-sm" />,
        };
      }
      if (task.payload.toolName === "python_repl_tool") {
        taskInfo = {
          typeName: "正在编码",
          title: `正在编码`,
          icon: <Code className="h-4 w-4 shrink-0 text-sm" />,
        };
      }
      if (task.payload.toolName === "bash_tool") {
        taskInfo = {
          typeName: "正在执行终端命令",
          title: `正在执行终端命令`,
          icon: <Monitor className="h-4 w-4 shrink-0 text-sm" />,
        };
      }
      if (task.payload.toolName === "analyze_document_content") {
        taskInfo = {
          typeName: "解析文档",
          title: `正在解析文档内容…`,
          icon: <FileText className="h-4 w-4 shrink-0 text-sm" />,
        };
      }
      if (task.payload.toolName === "crawl_tool") {
        taskInfo = {
          typeName: "浏览网页",
          title: `正在浏览网页 ${task.payload.input.url}`,
          icon: <TextSearch className="h-4 w-4 shrink-0 text-sm" />,
        };
      }
      if (task.payload.toolName === "get_table_info") {
        taskInfo = {
          typeName: "正在学习数据库",
          title: `正在学习数据库  ${task.payload.input.table_name ?? ""}`,
          icon: <Database className="h-4 w-4 shrink-0 text-sm" />,
        };
      }
      if (task.payload.toolName === "get_table_relationships") {
        taskInfo = {
          typeName: "正在分析数据库结构",
          title: `正在分析数据库结构 ${task.payload.input.table_name ?? ""}`,
          icon: <Database className="h-4 w-4 shrink-0 text-sm" />,
        };
      }
      if (task.payload.toolName === "execute_oracle_query") {
        taskInfo = {
          typeName: "正在查询数据库",
          title: `正在查询数据库 ${task.payload.input.sql ?? ""}`,
          icon: <DatabaseBackup className="h-4 w-4 shrink-0 text-sm" />,
        };
      }
      if (task.payload.toolName === "get_task_files_json") {
        taskInfo = {
          typeName: "正在生成文件",
          title: `正在生成文件 ${task.payload.input.sql ?? ""}`,
          icon: <DatabaseBackup className="h-4 w-4 shrink-0 text-sm" />,
        };
      }
      if (task.payload.toolName === "generate_echarts_chart") {
        taskInfo = {
          typeName: "正在绘制图表",
          title: "正在绘制图表",
          icon: <BarChart3 className="h-4 w-4 shrink-0 text-sm" />,
        };
      }
      return taskInfo;
    default:
      return null;
  }
}
