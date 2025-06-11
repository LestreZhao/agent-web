import { env } from "~/env";
import { service } from "~/lib/axios";
import { type Message } from "~/types/message";

import { fetchStream } from "../sse";

import { type ChatEvent } from "./types";

// 聊天流
export function chatStream(
  userMessage: Message,
  state: { messages: { role: string; content: string }[] },
  params: { deepThinkingMode: boolean; searchBeforePlanning: boolean },
  options: { abortSignal?: AbortSignal } = {},
) {
  return fetchStream<ChatEvent>(env.NEXT_PUBLIC_API_URL + "/chat/stream", {
    body: JSON.stringify({
      messages: [...state.messages, userMessage],
      deep_thinking_mode: params.deepThinkingMode,
      search_before_planning: params.searchBeforePlanning,
      debug:
        location.search.includes("debug") &&
        !location.search.includes("debug=false"),
    }),
    signal: options.abortSignal,
  });
}

// 获取聊天历史
export const getChatHistory = async () => {
  const response = await service.get("/chat/history");
  console.log("response", response);
  return response.data;
};
