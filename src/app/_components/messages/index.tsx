import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState, useCallback, memo, useMemo } from "react";

import { MessageLoading } from "~/app/_components/messages/message-loading";
import { Markdown } from "~/components/comon/Markdown";
import { cn } from "~/core/utils";
import { type Message } from "~/types/message";

type UserMessage = Message;

import { ChatFilePreviewItem } from "../file-preview";

import { MessagesTaskView } from "./messages-task-view";

// 节流函数
const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number,
) => {
  let inThrottle: boolean;
  let lastRan: number;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;
      setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          inThrottle = false;
        }
      }, limit);
    }
  };
};

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
  const lastMessageLength = useRef(messages.length);
  const userScrolling = useRef(false);
  const scrollTimeoutRef = useRef<number>();
  const resizeTimeoutRef = useRef<number>();
  const lastMessageId = useRef<string>();
  // 检查是否有新消息
  const hasNewMessage = useCallback(() => {
    if (messages.length === 0) return false;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessageId.current !== lastMessage.id) {
      lastMessageId.current = lastMessage.id;
      return true;
    }
    return false;
  }, [messages]);

  // 缓动函数
  const easeOutCubic = useCallback((t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  }, []);

  // 优化后的平滑滚动
  const smoothScrollToBottom = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const targetScroll = container.scrollHeight - container.clientHeight;

    // 直接滚动到底部
    container.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });

    // 确保滚动完成后更新状态
    setTimeout(() => {
      if (containerRef.current) {
        const finalCheck =
          Math.abs(
            containerRef.current.scrollHeight -
              containerRef.current.clientHeight -
              containerRef.current.scrollTop,
          ) < 30;
        setShowScrollButton(!finalCheck);
        if (finalCheck) {
          setAutoScroll(true);
          userScrolling.current = false;
        }
      }
    }, 300);
  }, [easeOutCubic]);

  // 滚动处理
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 30;

    // 检测用户滚动
    const scrollDiff = Math.abs(scrollTop - lastScrollTop.current);
    if (scrollDiff > 30) {
      userScrolling.current = true;
      if (!isAtBottom) {
        setAutoScroll(false);
      }
    }

    // 如果滚动到底部，重置状态
    if (isAtBottom) {
      setAutoScroll(true);
      userScrolling.current = false;
      setShowScrollButton(false);
    } else {
      setShowScrollButton(true);
    }

    lastScrollTop.current = scrollTop;
  }, []);

  // 使用节流处理滚动事件
  const throttledHandleScroll = useMemo(
    () => throttle(handleScroll, 100), // 100ms 的节流
    [handleScroll],
  );

  // 监听容器大小变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = window.setTimeout(() => {
        if (autoScroll) {
          smoothScrollToBottom();
        }
      }, 100); // 100ms 的防抖
    });

    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        cancelAnimationFrame(scrollTimeoutRef.current);
      }
    };
  }, [autoScroll, smoothScrollToBottom]);

  // 消息更新时的滚动处理
  useEffect(() => {
    const messageCountChanged = messages.length !== lastMessageLength.current;
    const newMessage = hasNewMessage();
    lastMessageLength.current = messages.length;

    if (
      (messageCountChanged || newMessage) &&
      (autoScroll || loading) &&
      !userScrolling.current
    ) {
      if (scrollTimeoutRef.current) {
        cancelAnimationFrame(scrollTimeoutRef.current);
      }
      requestAnimationFrame(smoothScrollToBottom);
    }
  }, [messages, autoScroll, smoothScrollToBottom, loading, hasNewMessage]);

  // useMemo 缓存消息渲染
  const messageElements = useMemo(() => {
    return (
      <div className="flex flex-col space-y-4">
        {messages.map((message, index) => (
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
        onScroll={throttledHandleScroll}
        style={{
          scrollBehavior: "smooth",
          willChange: "scroll-position",
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
          transition={{
            duration: 0.2,
          }}
          className="absolute bottom-[50px] left-1/2 -translate-x-1/2 rounded-full bg-white p-2 shadow-lg shadow-black/10 transition-transform"
          onClick={() => {
            if (!containerRef.current) return;
            userScrolling.current = false;
            setAutoScroll(true);
            containerRef.current.scrollTo({
              top:
                containerRef.current.scrollHeight -
                containerRef.current.clientHeight,
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
            src="/images/fusion_ai.png"
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
