import { create } from "zustand";

export const useUIStore = create<{
  // 是否展开右侧任务视图
  expandTaskView: boolean;
  setExpandTaskView: (expand: boolean) => void;
  // 是否展开左侧侧边栏
  expandSidebar: boolean;
  setExpandSidebar: (expand: boolean) => void;
  // 是否浮动侧边栏
  isFloatingSidebar: boolean;
  setIsFloatingSidebar: (isFloating: boolean) => void;
}>((set) => ({
  expandTaskView: false,
  setExpandTaskView: (expand: boolean) => set({ expandTaskView: expand }),
  expandSidebar: false,
  setExpandSidebar: (expand: boolean) => set({ expandSidebar: expand }),
  isFloatingSidebar: false,
  setIsFloatingSidebar: (isFloating: boolean) =>
    set({ isFloatingSidebar: isFloating }),
}));
