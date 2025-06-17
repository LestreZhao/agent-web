"use client";
import { motion } from "framer-motion";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { uploadFile } from "~/core/api/file";
import { useMessageStore } from "~/core/store/message";
import { cn } from "~/core/utils";

import { AppHeader } from "../../components/AppHeader";
import { ChatInput } from "../_components/chat-input";
import { ChatSuggestions } from "../_components/chat-suggestions";

export default function HomePage() {
  const router = useRouter();
  // 用户输入
  const [message, setMessage] = useState("");

  const { setInitMessages, setFiles } = useMessageStore();

  // 发送消息
  const handleSendMessage = async (
    content: string,
    // config: { deepThinkingMode: boolean; searchBeforePlanning: boolean },
  ) => {
    setInitMessages(content);
    router.push(`/chat/${nanoid()}`);
  };
  // 点击快速建议
  const handleSuggestionClick = useCallback((action: string) => {
    setMessage(action);
  }, []);

  const { files } = useMessageStore();

  // 上传文件
  const handleFileUpload = useCallback(
    (file: File) => {
      return uploadFile(file)
        .then((res) => {
          if (res.success) {
            const reviewFile = {
              id: res.file_id,
              name: res.document_info.filename,
              size: res.document_info.file_size,
              type: res.document_info.file_type,
              url: res.download_url,
            };
            setFiles([reviewFile, ...files]);
          }
          return res;
        })
        .catch((err) => {
          toast.error("上传失败,请重新上传");
          return null;
        });
    },
    [files],
  );

  const handleDeleteFile = useCallback(
    (file: File) => {
      setFiles(files.filter((f) => f.name !== file.name));
    },
    [files],
  );

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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mx-4 mb-4 w-full text-3xl font-medium leading-9"
            style={{
              fontFamily:
                "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
            }}
          >
            <h3>你好</h3>
            <h4 className="text-[#858481]">我能为你做什么?</h4>
          </motion.div>
          <div>
            <ChatInput
              message={message}
              setMessage={setMessage}
              onSend={handleSendMessage}
              onUpload={handleFileUpload}
              deleteFile={handleDeleteFile}
              placeholder="给 FusionAI 一个任务…"
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
