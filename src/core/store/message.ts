import { create } from "zustand";

import { type Message, type ReviewFile } from "~/types/message";
import { clone } from "../utils";

interface MessageState {
  chatId: string;
  initMessages: string;
  responding: boolean;
  messages: Message[];
  files: ReviewFile[];
  currentFile: ReviewFile | null;
  state: {
    messages: Message[];
  };
}

interface MessageStore extends MessageState {
  setCurrentFile: (file: ReviewFile) => void;
  setFiles: (files: ReviewFile[]) => void;
  setInitMessages: (message: string) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (message: Partial<Message> & { id: string }) => void;
  setResponding: (responding: boolean) => void;
  setChatId: (chatId: string) => void;
  clearMessages: () => void;
  _setState: (state: { messages: Message[] }) => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  chatId: "",
  initMessages: "",
  messages: [],
  responding: false,
  files: [],
  currentFile: null,
  state: {
    messages: [],
  },

  setCurrentFile: (file) => set({ currentFile: file }),
  setFiles: (files) => set({ files }),
  setInitMessages: (message) => set({ initMessages: message }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (message) =>
    set((state) => {
      const index = state.messages.findIndex((m) => m.id === message.id);
      if (index === -1) {
        return state;
      }
      const newMessage = clone({
        ...state.messages[index],
        ...message,
      } as Message);
      return {
        messages: [
          ...state.messages.slice(0, index),
          newMessage,
          ...state.messages.slice(index + 1),
        ],
      };
    }),
  setResponding: (responding) => set({ responding }),
  setChatId: (chatId) => set({ chatId }),
  clearMessages: () =>
    set({
      state: { messages: [] },
      messages: [],
      initMessages: "",
      chatId: "",
      files: [],
    }),
  _setState: (state) => set({ state }),
}));
