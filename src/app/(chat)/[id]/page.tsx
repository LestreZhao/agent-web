"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useRef, useEffect, useState, useMemo } from "react";

import ChatHeader from "~/app/_components/ChatHeader";
import { InputBox } from "~/app/_components/InputBox";
import { sendMessage, setInitMessages, useMessageStore } from "~/core/store";
import { useUIStore } from "~/core/store/ui";

import { MessageHistoryView } from "../_components/MessageHistoryView";
import TaskPreview from "../_components/TaskPreview";
import { mockMessages } from "../mock";
import { useTaskStore } from "~/core/store/task";

// 获取最新step的最新task的函数
const getLatestStepTask = (messages: any[]) => {
  const lastMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;

  if (
    lastMessage?.role !== "assistant" ||
    !lastMessage?.content?.workflow?.steps
  )
    return null;
  const steps = lastMessage.content.workflow.steps;
  const latestStep = steps[steps.length - 1];
  if (!latestStep?.tasks) return null;

  const tasks = latestStep.tasks;
  return tasks[tasks.length - 1];
};

export default function ChatPage() {
  // 添加ref来跟踪初始消息是否已发送
  const initialMessageSentRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messages = useMessageStore((state) => state.messages);
  // const messages = mockMessages;
  const responding = useMessageStore((state) => state.responding);
  const initMessage = useMessageStore((state) => state.initMessages);
  const [message, setMessage] = useState("");

  const { setCurrentTask } = useTaskStore();
  const { expandTaskView, setExpandTaskView } = useUIStore();

  // 获取最新step的最新task
  useEffect(() => {
    const latestTask = getLatestStepTask(messages);
    if (latestTask) {
      setCurrentTask(latestTask);
    }
  }, [messages, setCurrentTask]);

  // 获取聊天标题
  const chatHeader = useMemo(() => {
    return messages[0]?.role === "user"
      ? messages[0]?.content.toString().slice(0, 12) + "..."
      : "Fusion";
  }, [messages]);

  // 获取聊天id
  const { id } = useParams<{ id: string }>();
  // 发送消息
  const handleSendMessage = async (
    message: string,
    config: { deepThinkingMode: boolean; searchBeforePlanning: boolean },
  ) => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    await sendMessage(
      {
        id,
        role: "user",
        type: "text",
        content: message,
      },
      config,
      {
        abortSignal: abortController.signal,
      },
    );
    abortControllerRef.current = null;
  };

  useEffect(() => {
    const sendInitialMessage = async () => {
      // 只有当初始消息存在且尚未发送过时才发送
      if (initMessage && !initialMessageSentRef.current) {
        initialMessageSentRef.current = true; // 标记为已发送
        console.log("Sending initial message once:", initMessage);
        await handleSendMessage(initMessage, {
          deepThinkingMode: false,
          searchBeforePlanning: false,
        });
        // 发送后清除初始化消息
        setInitMessages("");
      }
    };
    void sendInitialMessage();
  }, [initMessage, id]);

  return (
    <div className="flex h-full w-full">
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: expandTaskView ? "50%" : "100%" }}
        transition={{ duration: 0.3 }}
        className="relative flex h-full w-full flex-col"
      >
        <div className="relative mx-auto flex h-full w-full min-w-0 max-w-full flex-1 flex-col px-5 sm:min-w-[390px] sm:max-w-[768px]">
          <div className="sticky top-0 z-10 flex flex-shrink-0 flex-row items-center justify-between bg-[var(--background-gray-main)] pb-1 pt-3">
            <ChatHeader header={chatHeader} />
          </div>
          <div className="flex w-full flex-1 flex-col gap-[12px] overflow-scroll pb-[60px] pt-[12px]">
            <MessageHistoryView
              className="w-full"
              messages={messages}
              loading={responding}
            />
          </div>
          <div className="sticky bottom-4 flex flex-col">
            {!expandTaskView &&
              messages[messages.length - 1]?.role === "assistant" &&
              messages[messages.length - 1]?.content.workflow &&
              messages[messages.length - 1]?.content.workflow.plans &&
              messages[messages.length - 1]?.content.workflow.plans.length >
                0 && (
                <TaskPreview
                  responding={responding}
                  expand={expandTaskView}
                  setExpand={setExpandTaskView}
                  tasks={messages[messages.length - 1]?.content.workflow?.plans}
                />
              )}
            <InputBox
              message={message}
              setMessage={setMessage}
              className="w-full"
              size="small"
              responding={responding}
              onSend={handleSendMessage}
              onCancel={() => {
                abortControllerRef.current?.abort();
              }}
              placeholder="发送消息给Fusion AI"
            />
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: expandTaskView ? "50%" : "0%" }}
        transition={{ duration: 0.3 }}
        className="h-full w-full overflow-hidden"
      >
        <TaskPreview
          responding={responding}
          className="h-full"
          expand={expandTaskView}
          setExpand={setExpandTaskView}
          tasks={messages[messages.length - 1]?.content.workflow?.plans}
        />
      </motion.div>
    </div>
  );
}
