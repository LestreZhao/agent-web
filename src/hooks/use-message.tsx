// src/hooks/useMessage.ts
import { useCallback } from "react";

import { type ChatEvent, chatStream } from "~/core/api";
import { chatStream as mockChatStream } from "~/core/api/mock";
import { useMessageStore } from "~/core/store/message";
import { WorkflowEngine } from "~/core/workflow";
import {
  type Message,
  type TextMessage,
  type WorkflowMessage,
} from "~/types/message";

export function useMessageHook() {
  const {
    messages,
    responding,
    addMessage,
    updateMessage,
    setResponding,
    _setState,
  } = useMessageStore();

  const sendMessage = useCallback(
    async (
      message: Message,
      params: {
        deepThinkingMode: boolean;
        searchBeforePlanning: boolean;
      },
      options: { abortSignal?: AbortSignal } = {},
    ) => {
      addMessage(message);
      const stream = window.location.search.includes("mock")
        ? mockChatStream(message)
        : chatStream(
            message,
            useMessageStore.getState().state,
            params,
            options,
          );

      setResponding(true);
      let textMessage: TextMessage | null = null;

      try {
        for await (const event of stream) {
          switch (event.type) {
            case "start_of_agent":
              textMessage = {
                id: event.data.agent_id,
                role: "assistant",
                type: "text",
                content: "",
              };
              addMessage(textMessage);
              break;

            case "message":
              if (textMessage) {
                textMessage.content += event.data.delta.content;
                updateMessage({
                  id: textMessage.id,
                  content: textMessage.content,
                });
              }
              break;

            case "end_of_agent":
              textMessage = null;
              break;

            case "start_of_workflow":
              await handleWorkflow(event, stream);
              break;
          }
        }
      } catch (e) {
        handleError(e, textMessage);
      } finally {
        setResponding(false);
      }

      return message;
    },
    [],
  );

  // 处理工作流
  const handleWorkflow = async (
    event: ChatEvent,
    stream: AsyncIterable<ChatEvent>,
  ) => {
    const workflowEngine = new WorkflowEngine();
    const workflow = workflowEngine.start(event);
    const workflowMessage: WorkflowMessage = {
      id: event.data.workflow_id,
      role: "assistant",
      type: "workflow",
      content: { workflow },
    };

    addMessage(workflowMessage);
    for await (const updatedWorkflow of workflowEngine.run(stream)) {
      updateMessage({
        id: workflowMessage.id,
        content: { workflow: updatedWorkflow },
      });
    }
    _setState({
      messages: workflow.finalState?.messages ?? [],
    });
  };

  // 错误处理
  const handleError = (error: any, textMessage: TextMessage | null) => {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }

    if (textMessage) {
      textMessage.content = "\n\n任务意外终止，请重新尝试";
      addMessage({
        id: textMessage.id,
        role: "assistant",
        type: "text",
        content: textMessage.content,
      });
    }
    throw error;
  };

  return {
    messages,
    responding,
    sendMessage,
  };
}
