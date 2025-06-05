import { create } from "zustand";

export const useTaskStore = create<{
  // 任务视图展示的任务类型
  isSelectedTask: boolean;
  setIsSelectedTask: (isSelectedTask: boolean) => void;
  // 当前展示在任务预览中的步骤
  currentStepInfo: any;
  setCurrentStepInfo: (step: any) => void;
  // 选中的展示在任务预览中的任务
  selectedTask: string;
  setSelectedTask: (task: string) => void;
  // 当前正在执行的任务
  currentTask: any;
  setCurrentTask: (task: any) => void;
}>((set) => ({
  isSelectedTask: false,
  setIsSelectedTask: (isSelectedTask: boolean) => set({ isSelectedTask }),
  currentStepInfo: {
    step_index: 1,
    total_steps: 4,
    step_info: {
      agent_name: "researcher",
      title: "收集糖尿病血糖控制评估标准及干预措施",
      description:
        "搜索糖尿病血糖控制的评估指标（如HbA1c水平）、筛查方法以及相关的个性化干预策略，输出一份Markdown格式的研究报告。",
    },
  },
  setCurrentStepInfo: (step: any) => set({ currentStepInfo: step }),
  selectedTask: "",
  setSelectedTask: (task: string) => set({ selectedTask: task }),
  currentTask: null,
  setCurrentTask: (task: any) => set({ currentTask: task }),
}));
