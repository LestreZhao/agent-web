interface TaskInfo {
  typeName: string;
  title: string;
  icon: React.ReactNode;
}

interface Task {
  type: "thinking" | "tool_call";
  agentName?: string;
  payload?: {
    toolName: string;
    input: Record<string, any>;
  };
}

const THINKING_TASKS: Record<string, Partial<TaskInfo>> = {
  default: {
    typeName: "FusionAI 正在分析",
    title: "正在分析数据内容…",
    icon: <img src="/icon.png"
            alt="FusionAI"
            width={16}
            height={16}
            className="h-4 w-4 shrink-0 rounded-full"
          />,
  },
  db_analyst: {
    title: "正在分析数据库查询结果…",
  },
  researcher: {
    title: "正在分析网页信息…",
  },
  chart_generator: {
    title: "正在生成可视化图表…",
  },
  reporter: {
    title: "正在生成任务报告…",
  },
};

const TOOL_TASKS: Record<string, TaskInfo> = {
  tavily_search: {
    typeName: "检索数据",
    title: (input) => `正在检索 ${input.query}`,
    icon: ICONS.SEARCH,
  },
  python_repl_tool: {
    typeName: "正在编码",
    title: "正在编码",
    icon: ICONS.CODE,
  },
  bash_tool: {
    typeName: "正在执行终端命令",
    title: "正在执行终端命令",
    icon: ICONS.MONITOR,
  },
  // ... 其他工具配置
};
