"use client";

import { nanoid } from "nanoid";
import { useCallback, useRef } from "react";

import { sendMessage, useStore } from "~/core/store";
import { cn } from "~/core/utils";

import { AppHeader } from "./_components/AppHeader";
import { InputBox } from "./_components/InputBox";
import { MessageHistoryView } from "./_components/MessageHistoryView";

export default function HomePage() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const messages = useStore((state) => state.messages);
  const responding = useStore((state) => state.responding);
  const handleSendMessage = useCallback(
    async (
      content: string,
      config: { deepThinkingMode: boolean; searchBeforePlanning: boolean },
    ) => {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      await sendMessage(
        {
          id: nanoid(),
          role: "user",
          type: "text",
          content,
        },
        config,
        { abortSignal: abortController.signal },
      );
      abortControllerRef.current = null;
    },
    [],
  );
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="flex min-h-screen min-w-page flex-col items-center">
        <header className="fixed left-0 right-0 top-0 flex h-16 w-full items-center px-4">
          <AppHeader />
        </header>
        <main className="mb-48 mt-16 px-4">
          <MessageHistoryView
            className="w-page"
            messages={messages}
            loading={responding}
          />
        </main>
        <footer
          className={cn(
            "fixed bottom-4 transition-transform duration-500 ease-in-out",
            messages.length === 0 ? "w-[640px] translate-y-[-34vh]" : "w-page",
          )}
        >
          {messages.length === 0 && (
            <div className="flex w-[640px] translate-y-[-32px] flex-col items-center">
              <h2 className="mb-2 text-center text-2xl font-normal text-gray-700">
                你好，{typeof window !== 'undefined' && window.localStorage.getItem('userName') || 'zhao Lester'}
              </h2>
              <h1 className="mb-8 text-center text-3xl font-normal text-gray-700">
                我能为你做什么？
              </h1>
            </div>
          )}
          <div className="flex flex-col overflow-hidden rounded-[24px] border bg-white shadow-lg">
            <InputBox
              size={messages.length === 0 ? "large" : "normal"}
              responding={responding}
              onSend={handleSendMessage}
              onCancel={() => {
                abortControllerRef.current?.abort();
                abortControllerRef.current = null;
              }}
            />
          </div>
          {messages.length === 0 && (
            <div className="mt-4 flex gap-3">
              <button 
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm"
                onClick={() => handleSendMessage('帮我制作一份个人简历', { deepThinkingMode: false, searchBeforePlanning: false })}
              >
                个人简历制作 <span className="text-xs">↑</span>
              </button>
              <button 
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm"
                onClick={() => handleSendMessage('帮我搜索特惠公寓信息', { deepThinkingMode: false, searchBeforePlanning: true })}
              >
                特惠公寓搜索 <span className="text-xs">↑</span>
              </button>
              <button 
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm"
                onClick={() => handleSendMessage('帮我制作一个p5.js动画效果', { deepThinkingMode: false, searchBeforePlanning: false })}
              >
                制作 p5.j s动画 <span className="text-xs">↑</span>
              </button>
            </div>
          )}
          <div className="absolute bottom-[-32px] h-8 w-page backdrop-blur-sm" />
        </footer>
      </div>
    </div>
  );
}
