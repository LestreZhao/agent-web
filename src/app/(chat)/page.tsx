"use client";

import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { setInitMessages } from "~/core/store";
import { cn } from "~/core/utils";

import { AppHeader } from "../../components/AppHeader";
import { ChatInput } from "../_components/chat-input";
import { ChatSuggestions } from "../_components/chat-suggestions";
import { Button } from "~/components/ui/button";
import { useUIStore } from "~/core/store/ui";
import { PanelLeft } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  // 用户输入
  const [message, setMessage] = useState("");
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

  const { expandSidebar, setExpandSidebar, setIsFloatingSidebar } =
    useUIStore();
  return (
    <div className="flex w-full flex-col">
      <header className="ml-6 flex w-full items-center pt-4">
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
            <ChatInput
              message={message}
              setMessage={setMessage}
              onSend={handleSendMessage}
              placeholder="给 Fusion AI 一个任务…"
            />
          </div>
          <div className="my-4 w-full">
            <ChatSuggestions onSuggestionClick={handleSuggestionClick} />
          </div>
        </div>
      </main>
    </div>
  );
}
