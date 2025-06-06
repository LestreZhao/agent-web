import { motion } from "framer-motion";
import { ArrowUp, Square } from "lucide-react";
import { type KeyboardEvent, useCallback, useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/core/utils";

export function ChatInput({
  message,
  setMessage,
  className,
  size,
  responding,
  onSend,
  onCancel,
  placeholder,
}: {
  message: string;
  setMessage: (message: string) => void;
  className?: string;
  size?: "large" | "normal" | "small";
  responding?: boolean;
  onSend?: (
    message: string,
    options: { deepThinkingMode: boolean; searchBeforePlanning: boolean },
  ) => void;
  onCancel?: () => void;
  placeholder?: string;
}) {
  const [deepThinkingMode, setDeepThinkMode] = useState(false);
  const [searchBeforePlanning, setSearchBeforePlanning] = useState(false);
  const [imeStatus, setImeStatus] = useState<"active" | "inactive">("inactive");
  const saveConfig = useCallback(() => {
    try {
      localStorage.setItem(
        "fusionai.config.inputbox",
        JSON.stringify({ deepThinkingMode, searchBeforePlanning }),
      );
    } catch (e) {
      console.error("保存配置到localStorage失败", e);
    }
  }, [deepThinkingMode, searchBeforePlanning]);
  useEffect(() => {
    const config = localStorage.getItem("fusionai.config.inputbox");
    if (config) {
      const { deepThinkingMode, searchBeforePlanning } = JSON.parse(config);
      setDeepThinkMode(deepThinkingMode);
      setSearchBeforePlanning(searchBeforePlanning);
    }
  }, []);
  useEffect(() => {
    saveConfig();
  }, [deepThinkingMode, searchBeforePlanning, saveConfig]);
  const handleSendMessage = useCallback(() => {
    if (responding) {
      onCancel?.();
    } else {
      if (message.trim() === "") {
        return;
      }
      if (onSend) {
        onSend(message, { deepThinkingMode, searchBeforePlanning });
        setMessage("");
      }
    }
  }, [
    responding,
    setMessage,
    onCancel,
    message,
    onSend,
    deepThinkingMode,
    searchBeforePlanning,
  ]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (responding) {
        return;
      }
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.metaKey &&
        !event.ctrlKey &&
        imeStatus === "inactive"
      ) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [responding, imeStatus, handleSendMessage],
  );
  return (
    <div className={cn(className)}>
      <motion.div className="flex flex-col overflow-hidden rounded-[24px] border bg-white p-3 shadow-lg">
        <div className="w-full">
          <textarea
            className={cn(
              "m-0 w-full resize-none border-none text-[15px]",
              size === "large" ? "h-12" : size === "small" ? "h-8" : "min-h-4",
            )}
            placeholder={placeholder}
            value={message}
            onCompositionStart={() => setImeStatus("active")}
            onCompositionEnd={() => setImeStatus("inactive")}
            onKeyDown={handleKeyDown}
            onChange={(event) => {
              setMessage(event.target.value);
            }}
          />
        </div>
        <div className="flex justify-end">
          {/* <div className="flex flex-grow items-center gap-2">
            <button
              className={cn(
                "flex h-8 items-center gap-2 rounded-2xl border px-4 text-sm transition-shadow hover:shadow",
                deepThinkingMode
                  ? "border-primary bg-primary/15 text-primary"
                  : "text-button hover:bg-button-hover hover:text-button-hover",
              )}
              onClick={() => {
                setDeepThinkMode(!deepThinkingMode);
              }}
            >
              <Atom className="h-4 w-4" />
              <span>Deep Think</span>
            </button>
            <button
              className={cn(
                "flex h-8 items-center rounded-2xl border px-4 text-sm transition-shadow hover:shadow",
                searchBeforePlanning
                  ? "border-primary bg-primary/15 text-primary"
                  : "text-button hover:bg-button-hover hover:text-button-hover",
              )}
              onClick={() => {
                setSearchBeforePlanning(!searchBeforePlanning);
              }}
            >
              <GlobalOutlined className="h-6 w-6" />
              <span>Search</span>
            </button>
          </div> */}
          <div className="flex flex-shrink-0 justify-end gap-2">
            <Button
              className={`h-8 w-8 rounded-full bg-[#37352F14] font-medium ${
                message.length > 0 || responding
                  ? "bg-black text-white"
                  : "bg-[#37352F14] text-[#b9b9b7] hover:bg-[#37352F14]"
              }`}
              onClick={handleSendMessage}
            >
              {responding ? (
                <Square className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
