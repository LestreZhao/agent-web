"use client";

import { motion } from "framer-motion";
import { nanoid } from "nanoid";
import { useParams } from "next/navigation";
import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";

import ChatHeader from "~/app/_components/chat-header";
import { ChatInput } from "~/app/_components/chat-input";
import FileContent from "~/app/_components/file-content";
import TaskPreview from "~/app/_components/task/task-preview";
import { uploadFile } from "~/core/api/file";
import { useMessageStore } from "~/core/store/message";
import { useTaskStore } from "~/core/store/task";
import { useUIStore } from "~/core/store/ui";
import { useMessageHook } from "~/hooks/use-message";
import { type Message, type WorkflowMessage } from "~/types/message";

import { MessagesView } from "../../_components/messages";

export default function ChatPage() {
  // 添加ref来跟踪初始消息是否已发送
  const initialMessageSentRef = useRef(false);
  // 断开请求的控制器
  const abortControllerRef = useRef<AbortController | null>(null);

  // 用户输入
  const [message, setMessage] = useState("");

  const {
    messages, // 消息列表
    responding, // 是否正在响应
    initMessages: initMessage, // 初始消息
    currentFile, // 用户选择查看的文件
  } = useMessageStore();
  const { sendMessage } = useMessageHook();

  // 设置当前模型正在执行的任务
  const { setCurrentTask, isSelectedTask } = useTaskStore();
  // 是否展开任务视图
  const { expandTaskView, setExpandTaskView, isFilePreview, setIsFilePreview } =
    useUIStore();

  // 获取聊天id
  const { id } = useParams<{ id: string }>();
  // 文件
  const { files, setFiles, setInitMessages } = useMessageStore();
  const isUploading = useRef(false);
  // 发送消息
  const handleSendMessage = async (
    message: string,
    config: { deepThinkingMode: boolean; searchBeforePlanning: boolean },
  ) => {
    if (isUploading.current) {
      toast.warning("请等待文件上传完成");
      return;
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const userMessage = {
      id: nanoid(),
      role: "user",
      type: "text",
      content: message,
    };
    if (files.length > 0) {
      userMessage.content += `。用户上传了文件，文件ID为：${files.map((file) => file.id).join(",")}`;
      userMessage.files = files;
    }
    await sendMessage(userMessage, config, {
      abortSignal: abortController.signal,
    });
    setFiles([]);
    abortControllerRef.current = null;
  };
  // 获取聊天标题
  const chatHeader = useMemo(() => {
    return messages[0]?.role === "user"
      ? messages[0]?.content.toString()
      : "FusionAI";
  }, [messages]);

  // 获取任务计划
  const plans = useMemo(() => {
    const lastMessage = messages[messages.length - 1] as WorkflowMessage;
    if (!lastMessage?.content?.workflow?.plans) return [];
    return lastMessage.content.workflow.plans;
  }, [messages]);

  // 是否显示任务预览组件
  const showTaskPreview = useMemo(() => {
    // console.log(messages, "messages");
    return (
      messages[messages.length - 1]?.role === "assistant" && plans.length > 0
    );
  }, [messages, plans]);

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
        setInitMessages(null);
      }
    };
    void sendInitialMessage();
  }, [initMessage, id]);

  // 获取最新step的最新task
  useEffect(() => {
    const latestTask = getLatestStepTask(messages);
    if (latestTask) {
      // 如果最新任务是reporter，则不展开任务视图
      if (latestTask.agentName === "reporter" && !isSelectedTask) {
        setExpandTaskView(false);
      }
      setCurrentTask(latestTask);
    }
  }, [messages, setCurrentTask, setExpandTaskView]);

  // 上传文件
  const handleFileUpload = useCallback(
    (file: File) => {
      isUploading.current = true;
      return uploadFile(file)
        .then((res) => {
          if (res.success) {
            const reviewFile = {
              id: res.file_id,
              name: res.document_info.filename,
              size: res.document_info.file_size,
              type: res.document_info.file_type,
              url: res.download_url,
            };
            setFiles([reviewFile, ...files]);
          }
          return res;
        })
        .finally(() => {
          isUploading.current = false;
        })
        .catch((err) => {
          toast.error("上传失败,请重新上传");
          return null;
        });
    },
    [files, setFiles],
  );

  const handleDeleteFile = useCallback(
    (file: File) => {
      setFiles(files.filter((f) => f.name !== file.name));
    },
    [files, setFiles],
  );
  return (
    <div className="flex h-full w-full">
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: expandTaskView ? "50%" : "100%" }}
        transition={{ duration: 0.3 }}
        className="relative flex h-full w-full flex-col"
      >
        <div className="relative mx-auto flex h-full w-full min-w-0 max-w-full flex-1 flex-col px-5 sm:min-w-[390px] sm:max-w-[768px]">
          <div className="sticky top-0 flex flex-shrink-0 flex-row items-center justify-between bg-[var(--background-gray-main)] pb-1 pl-4 pt-3">
            <ChatHeader header={chatHeader} />
          </div>
          <div className="flex w-full flex-1 flex-col gap-[12px] overflow-scroll pb-[40px] pt-[12px]">
            <MessagesView
              className="w-full"
              messages={messages}
              loading={responding}
            />
          </div>
          <div className="sticky bottom-8 flex flex-col">
            {!expandTaskView && showTaskPreview && (
              <TaskPreview
                responding={responding}
                expand={expandTaskView}
                setExpand={setExpandTaskView}
                plans={plans}
              />
            )}
            <ChatInput
              message={message}
              setMessage={setMessage}
              className="w-full"
              size="small"
              responding={responding}
              onSend={handleSendMessage}
              onCancel={() => {
                abortControllerRef.current?.abort();
              }}
              placeholder="发送消息给FusionAI"
              onUpload={handleFileUpload}
              deleteFile={handleDeleteFile}
            />
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: expandTaskView ? "50%" : "0%" }}
        transition={{ duration: 0.3 }}
        className="h-full w-full overflow-hidden pb-8"
      >
        {isFilePreview ? (
          <FileContent
            file={currentFile}
            onClose={() => {
              setIsFilePreview(false);
              setExpandTaskView(false);
            }}
          />
        ) : (
          <TaskPreview
            responding={responding}
            className="h-full"
            expand={expandTaskView}
            setExpand={setExpandTaskView}
            plans={plans}
          />
        )}
      </motion.div>
    </div>
  );
}

// 获取最新step的最新task的函数
function getLatestStepTask(messages: any[]) {
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
}
