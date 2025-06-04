import { create } from "zustand";

export const useUIStore = create<{
  // 是否展开右侧任务视图
  expandTaskView: boolean;
  setExpandTaskView: (expand: boolean) => void;
}>((set) => ({
  expandTaskView: false,
  setExpandTaskView: (expand: boolean) => set({ expandTaskView: expand }),
}));
