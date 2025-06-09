import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

import { MessageLoading } from "~/app/_components/messages/message-loading";
import { Markdown } from "~/components/comon/Markdown";
import { type Message } from "~/core/messaging";
import { cn } from "~/core/utils";

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
  const lastScrollTop = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const isScrollingRef = useRef(false);

  const scrollToBottom = useCallback((instant = false) => {
    if (endRef.current) {
      endRef.current.scrollIntoView({
        behavior: instant ? "instant" : "smooth",
        block: "end",
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (containerRef.current && !isScrollingRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;

      // 检测用户是否向上滚动
      if (scrollTop < lastScrollTop.current) {
        setAutoScroll(false);
      }

      // 如果用户滚动到底部，恢复自动滚动
      if (isBottom) {
        setAutoScroll(true);
      }
      lastScrollTop.current = scrollTop;
      setShowScrollButton(!isBottom);
    }
  }, []);

  // 使用防抖处理滚动事件
  const debouncedHandleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      handleScroll();
    }, 100);
  }, [handleScroll]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", debouncedHandleScroll);
      return () => {
        container.removeEventListener("scroll", debouncedHandleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [debouncedHandleScroll]);

  useEffect(() => {
    if (autoScroll) {
      isScrollingRef.current = true;
      scrollToBottom();
      // 给一个短暂的延迟，让滚动动画完成
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    }
  }, [messages, autoScroll, scrollToBottom]);

  return (
    <div
      className={cn(className, "relative flex h-full flex-col overflow-hidden")}
    >
      <div
        className="flex-1 overflow-y-scroll"
        ref={containerRef}
        onScroll={debouncedHandleScroll}
      >
        {messages.map((message) => (
          <MessageView key={message.id} message={message} loading={loading} />
        ))}
        {loading && <MessageLoading className="mt-2" />}
        <div className="h-1" ref={endRef} />
      </div>
      {showScrollButton && (
        <div className="absolute bottom-1 flex w-full justify-center">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-full bg-white p-2 shadow-lg shadow-black/10"
            onClick={() => {
              setAutoScroll(true);
              scrollToBottom();
            }}
          >
            <ArrowDown className="h-5 w-5" />
          </motion.button>
        </div>
      )}
    </div>
  );
}

function MessageView({
  message,
  loading,
}: {
  message: UserMessage;
  loading: boolean;
}) {
  const content =
    message.role === "user" && (message as any).files
      ? message.content.toString().split("。用户上传了文件，文件ID为：")[0]
      : message.content;
  if (!content) return null;
  return (
    <div className={cn(message.role === "user" && "flex justify-end")}>
      {message.role === "assistant" && message.content && (
        <div className="px-2">
          <img
            src="/images/fusion_ai.png"
            alt="Fusion AI"
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
            <Markdown>{content.toString()}</Markdown>
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
            className="max-w-full pr-4"
            workflow={message.content.workflow}
          />
        </div>
      )}
    </div>
  );
}
