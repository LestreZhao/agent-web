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

  // 缓动函数
  const easeOutCubic = useCallback((t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  }, []);

  // 优化后的平滑滚动
  const smoothScrollToBottom = useCallback(() => {
    if (!containerRef.current || userScrolling.current) return;

    const container = containerRef.current;
    const targetScroll = container.scrollHeight - container.clientHeight;
    const startScroll = container.scrollTop;
    const distance = targetScroll - startScroll;

    if (Math.abs(distance) < 10) {
      container.scrollTop = targetScroll;
      return;
    }

    let start: number | null = null;
    const duration = 300;

    const animate = (timestamp: number) => {
      start ??= timestamp;
      const progress = (timestamp - start) / duration;

      if (progress < 1) {
        container.scrollTop = startScroll + distance * easeOutCubic(progress);
        scrollTimeoutRef.current = requestAnimationFrame(animate);
      } else {
        container.scrollTop = targetScroll;
      }
    };

    if (scrollTimeoutRef.current) {
      cancelAnimationFrame(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = requestAnimationFrame(animate);
  }, [easeOutCubic]);

  // 优化后的滚动处理
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 15;

    // 检测用户滚动
    if (
      !userScrolling.current &&
      Math.abs(scrollTop - lastScrollTop.current) > 15
    ) {
      userScrolling.current = true;
    }

    if (isAtBottom) {
      setAutoScroll(true);
      userScrolling.current = false;
    } else {
      setAutoScroll(false);
    }

    setShowScrollButton(!isAtBottom);
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
    lastMessageLength.current = messages.length;

    if (messageCountChanged && autoScroll && !userScrolling.current) {
      if (scrollTimeoutRef.current) {
        cancelAnimationFrame(scrollTimeoutRef.current);
      }
      requestAnimationFrame(smoothScrollToBottom);
    }
  }, [messages, autoScroll, smoothScrollToBottom]);

  // 优化消息渲染
  const messageElements = useMemo(
    () =>
      messages.map((message) => (
        <MessageView key={message.id} message={message} loading={loading} />
      )),
    [messages, loading],
  );

  return (
    <div
      className={cn(className, "relative flex h-full flex-col overflow-hidden")}
    >
      <div
        className="flex-1 overflow-y-scroll scroll-smooth"
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
          className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-white p-2 shadow-lg shadow-black/10 transition-transform hover:scale-110"
          onClick={() => {
            setAutoScroll(true);
            userScrolling.current = false;
            smoothScrollToBottom();
          }}
        >
          <ArrowDown className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  );
}

// 优化 MessageView 组件
const MessageView = memo(function MessageView({
  message,
  loading,
}: {
  message: UserMessage;
  loading: boolean;
}) {
  const content = useMemo(() => {
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
    <div className={cn(message.role === "user" && "flex justify-end")}>
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
            className="max-w-full pr-4"
            workflow={message.content.workflow}
          />
        </div>
      )}
    </div>
  );
});
