import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState, memo, useMemo } from "react";

import { MessageLoading } from "~/app/_components/messages/message-loading";
import { Markdown } from "~/components/comon/Markdown";
import { cn } from "~/core/utils";
import { type Message } from "~/types/message";

type UserMessage = Message;

import { ChatFilePreviewItem } from "../file-preview";

import { MessagesTaskView } from "./messages-task-view";

export function MessagesView({
  className,
  messages,
  loading,
}: {
  className?: string;
  messages: Message[];
  loading: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  // 使用 Intersection Observer 监听底部元素
  useEffect(() => {
    if (!endRef.current || !containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0]?.isIntersecting;
        setShowScrollButton(!isVisible);
        if (isVisible) {
          setAutoScroll(true);
        }
      },
      {
        root: containerRef.current,
        threshold: 1.0,
      },
    );
    observer.observe(endRef.current);
    return () => observer.disconnect();
  }, []);

  // 消息更新时的滚动处理
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading, autoScroll]);

  // useMemo 缓存消息渲染
  const messageElements = useMemo(() => {
    return (
      <div className="flex flex-col space-y-4">
        {messages.map((message) => (
          <MessageView key={message.id} message={message} loading={loading} />
        ))}
      </div>
    );
  }, [messages, loading]);

  return (
    <div
      className={cn(className, "relative flex h-full flex-col overflow-hidden")}
    >
      <div
        className={cn(
          "overflow-y-scroll scroll-smooth",
          messages.length > 0 && "pb-[80px]",
        )}
        ref={containerRef}
        onScroll={() => {
          if (!containerRef.current) return;
          const { scrollTop, scrollHeight, clientHeight } =
            containerRef.current;
          const isAtBottom = scrollHeight - clientHeight - scrollTop > 100;
          if (isAtBottom) {
            setAutoScroll(false);
          }
        }}
      >
        {messageElements}
        {loading && <MessageLoading className="mt-2" />}
        <div className="h-1" ref={endRef} />
      </div>

      {showScrollButton && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-[50px] left-1/2 -translate-x-1/2 rounded-full bg-white p-2 shadow-lg shadow-black/10 transition-transform"
          onClick={() => {
            if (!containerRef.current) return;
            setAutoScroll(true);
            containerRef.current.scrollTo({
              top: containerRef.current.scrollHeight,
              behavior: "smooth",
            });
          }}
        >
          <ArrowDown className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  );
}

// 消息视图
const MessageView = memo(function MessageView({
  message,
  loading,
  className,
}: {
  message: UserMessage;
  loading: boolean;
  className?: string;
}) {
  const content = useMemo(() => {
    // 过滤掉上传文件的文本内容，只保留用户输入的文本
    if (message.role === "user" && (message as any).files) {
      const rawContent = message.content;
      if (typeof rawContent === "string") {
        return rawContent.split("。用户上传了文件，文件ID为：")[0];
      }
      return typeof rawContent === "object"
        ? JSON.stringify(rawContent)
        : String(rawContent);
    }
    return message.content;
  }, [message]);

  if (!content) return null;

  const contentString =
    typeof content === "object" ? JSON.stringify(content) : String(content);

  return (
    <div
      className={cn(message.role === "user" && "flex justify-end", className)}
    >
      {message.role === "assistant" && message.content && (
        <div className="px-2">
          <img
            src="/images/fusion-ai.png"
            alt="FusionAI"
            className="h-5 w-auto"
          />
        </div>
      )}
      <div
        className={cn(
          "relative w-fit max-w-[90%] rounded-2xl py-3",
          message.role === "user" &&
            "mb-4 rounded-ee-none bg-white px-4 shadow-sm",
          message.role === "assistant" && "rounded-es-none",
        )}
      >
        {message.type === "text" && message.content && (
          <div className="flex flex-col">
            <Markdown>{contentString}</Markdown>
            {(message as any).files && (
              <div className="mt-2 flex flex-col gap-2">
                {(message as any).files.map((file: any) => (
                  <ChatFilePreviewItem
                    key={file.name}
                    file={file}
                    canRemove={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {message.type === "workflow" && message.content && (
        <div className="flex flex-col gap-2">
          <MessagesTaskView
            loading={loading}
            className="max-w-full"
            workflow={message.content.workflow}
          />
        </div>
      )}
    </div>
  );
});
