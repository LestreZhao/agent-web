import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { MessageLoading } from "~/app/_components/messages/message-loading";
import { Markdown } from "~/components/comon/Markdown";
import { type Message } from "~/core/messaging";
import { cn } from "~/core/utils";

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

  const scrollToBottom = () => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
      setShowScrollButton(!isBottom);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      className={cn(className, "relative flex h-full flex-col overflow-hidden")}
    >
      <div
        className="flex-1 overflow-y-scroll"
        ref={containerRef}
        onScroll={handleScroll}
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
            onClick={scrollToBottom}
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
    message.role === "user" && message.files
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
            <Markdown
              components={{
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {content.toString()}
            </Markdown>
            {message.files && (
              <div className="mt-2 flex flex-col gap-2">
                {message.files.map((file) => (
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
