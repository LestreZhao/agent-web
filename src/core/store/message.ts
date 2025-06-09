import { create } from "zustand";

import { UploadedFile, type ReviewFile } from "~/types/message";

import { type ChatEvent, chatStream } from "../api";
import { chatStream as mockChatStream } from "../api/mock";
import {
  type WorkflowMessage,
  type Message,
  type TextMessage,
} from "../messaging";
import { clone } from "../utils";
import { WorkflowEngine } from "../workflow";

import { useTaskStore } from "./task";

export const useMessageStore = create<{
  messages: Message[];
  chatId: string;
  initMessages: string;
  responding: boolean;
  state: {
    messages: Message[];
  };
  // 上传的文件
  files: ReviewFile[];
  // 当前文件
  currentFile: ReviewFile | null;
}>(() => ({
  // 当前对话 id
  chatId: "",
  // 初始化消息
  initMessages: "",
  // 当前对话的消息
  messages: [],
  // 是否正在响应
  responding: false,
  // 对话中上传的文件
  files: [],
  currentFile: {
    id: "cf2270e0-61fb-4d0b-a551-1be8a84b6f2b",
    name: "模块划在油气领域国内外的应用以及相关的难点、未来方向调研报告-AIGC检测报告-20250407.pdf",
    size: 48513,
    type: ".pdf",
    url: "http://192.168.120.251:8000/api/documents/cf2270e0-61fb-4d0b-a551-1be8a84b6f2b/download",
  },
  state: {
    messages: [],
  },
}));

// 设置当前文件
export function setCurrentFile(file: ReviewFile) {
  useMessageStore.setState({ currentFile: file });
}

// 设置文件
export function setFiles(files: ReviewFile[]) {
  useMessageStore.setState({ files });
}

// 设置初始化消息
export function setInitMessages(message: string) {
  useMessageStore.setState({ initMessages: message });
}

export function setMessages(messages: Message[]) {
  useMessageStore.setState({ messages });
}

export function addMessage(message: Message) {
  useMessageStore.setState((state) => ({
    messages: [...state.messages, message],
  }));
  return message;
}

export function updateMessage(message: Partial<Message> & { id: string }) {
  useMessageStore.setState((state) => {
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
  });
}

export async function sendMessage(
  message: Message,
  params: {
    deepThinkingMode: boolean;
    searchBeforePlanning: boolean;
  },
  options: { abortSignal?: AbortSignal } = {},
) {
  addMessage(message);
  let stream: AsyncIterable<ChatEvent>;
  if (window.location.search.includes("mock")) {
    stream = mockChatStream(message);
  } else {
    stream = chatStream(
      message,
      useMessageStore.getState().state,
      params,
      options,
    );
  }
  setResponding(true);

  let textMessage: TextMessage | null = null;
  try {
    for await (const event of stream) {
      switch (event.type) {
        case "start_of_agent":
          textMessage = {
            id: event.data.agent_id,
            role: "assistant",
            type: "text",
            content: "",
          };
          addMessage(textMessage);
          break;
        case "message":
          if (textMessage) {
            textMessage.content += event.data.delta.content;
            updateMessage({
              id: textMessage.id,
              content: textMessage.content,
            });
          }
          break;
        case "end_of_agent":
          textMessage = null;
          break;
        case "start_of_workflow":
          const workflowEngine = new WorkflowEngine();
          const workflow = workflowEngine.start(event);
          const workflowMessage: WorkflowMessage = {
            id: event.data.workflow_id,
            role: "assistant",
            type: "workflow",
            content: { workflow: workflow },
          };
          addMessage(workflowMessage);
          for await (const updatedWorkflow of workflowEngine.run(stream)) {
            updateMessage({
              id: workflowMessage.id,
              content: { workflow: updatedWorkflow },
            });
          }
          _setState({
            messages: workflow.finalState?.messages ?? [],
          });
          break;
        default:
          break;
      }
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return;
    }
    // 添加错误消息
    if (textMessage) {
      textMessage.content = "\n\n任务意外终止，请重新尝试";
      addMessage({
        id: textMessage.id,
        role: "assistant",
        type: "text",
        content: textMessage.content,
      });
    }
    throw e;
  } finally {
    setResponding(false);
  }
  return message;
}

export function clearMessages() {
  useMessageStore.setState({
    state: {
      messages: [],
    },
    messages: [],
    initMessages: "",
    chatId: "",
    files: [],
  });
  useTaskStore.getState().clearTaskState();
}

export function setResponding(responding: boolean) {
  useMessageStore.setState({ responding });
}

export function setChatId(chatId: string) {
  useMessageStore.setState({ chatId });
}

export function _setState(state: {
  messages: { role: string; content: string }[];
}) {
  useMessageStore.setState({ state });
}
