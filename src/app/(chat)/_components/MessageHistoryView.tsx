import Markdown from "react-markdown";

import { type Message } from "~/core/messaging";
import { cn } from "~/core/utils";

import { LoadingAnimation } from "~/app/_components/LoadingAnimation";
import { WorkflowProgressView } from "./WorkflowProgressView";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export function MessageHistoryView({
  className,
  messages,
  loading,
}: {
  className?: string;
  messages: Message[];
  loading: boolean;
}) {

  const endRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div className={cn(className, "relative flex h-full flex-col")}>
      <div
        className="flex-1 overflow-auto"
        ref={containerRef}
        onScroll={handleScroll}
      >
        {messages.map((message) => (
          <MessageView key={message.id} message={message} loading={loading} />
        ))}
        {loading && <LoadingAnimation className="mt-2" />}
        <div className="h-1" ref={endRef} />
      </div>
      {showScrollButton && (
        <div className="absolute bottom-[-10px] flex w-full justify-center">
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
  message: Message;
  loading: boolean;
}) {
  if (message.type === "text" && message.content) {
    return (
      <div className={cn("flex", message.role === "user" && "justify-end")}>
        <div
          className={cn(
            "relative w-fit max-w-[90%] rounded-2xl px-4 py-3 shadow-sm",
            message.role === "user" && "rounded-ee-none bg-white",
            message.role === "assistant" && "rounded-es-none bg-white",
          )}
        >
          <Markdown
            components={{
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {message.content}
          </Markdown>
        </div>
      </div>
    );
  } else if (message.type === "workflow") {
    return (
      <div className="flex flex-col gap-2">
        <div className="mt-4 px-2">
          <img
            src="/images/fusion_ai.png"
            alt="Fusion AI"
            className="h-5 w-auto"
          />
        </div>
        <WorkflowProgressView
          loading={loading}
          className="max-w-full pr-4"
          workflow={message.content.workflow}
        />
      </div>
    );
  }
  return null;
}
