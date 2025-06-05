"use client";

import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { setInitMessages, useMessageStore } from "~/core/store";
import { cn } from "~/core/utils";

import { AppHeader } from "../_components/AppHeader";
import { InputBox } from "../_components/InputBox";
import { QuickSuggestion } from "../_components/QuickSuggestion";
import { SidebarTrigger } from "~/components/ui/sidebar";

export default function HomePage() {
  const abortControllerRef = useRef<AbortController | null>(null);
  // 用户输入的message
  const [message, setMessage] = useState("");
  // 消息历史
  const messages = useMessageStore((state) => state.messages);
  const router = useRouter();
  // 发送消息
  const handleSendMessage = async (
    content: string,
    // config: { deepThinkingMode: boolean; searchBeforePlanning: boolean },
  ) => {
    setInitMessages(content);
    router.push(`/${nanoid()}`);
  };

  // 点击快速建议
  const handleSuggestionClick = useCallback((action: string) => {
    setMessage(action);
  }, []);

  return (
    <div className="flex w-full flex-col">
      <header className="flex h-16 w-full items-center">
        <AppHeader />
      </header>
      <main className="flex w-full flex-col items-center justify-center">
        <div
          className={cn(
            "mx-auto mt-[calc(28vh-10px)] w-full max-w-full sm:mt-[20vh] sm:min-w-[390px] sm:max-w-[768px]",
          )}
        >
          <div
            className="mx-4 mb-4 w-full text-3xl font-medium leading-9"
            style={{
              fontFamily:
                "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
            }}
          >
            <h3>你好</h3>
            <h4 className="text-[#858481]">我能为你做什么?</h4>
          </div>
          <div>
            <InputBox
              message={message}
              setMessage={setMessage}
              size={messages.length === 0 ? "large" : "normal"}
              onSend={handleSendMessage}
              onCancel={() => {
                abortControllerRef.current?.abort();
                abortControllerRef.current = null;
              }}
              placeholder="给 Fusion AI 一个任务…"
            />
          </div>
          <div className="my-4 w-full">
            <QuickSuggestion onSuggestionClick={handleSuggestionClick} />
          </div>
        </div>
      </main>
    </div>
  );
}
