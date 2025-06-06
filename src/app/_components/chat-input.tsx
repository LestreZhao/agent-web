import { ArrowUp, Square } from "lucide-react";
import { nanoid } from "nanoid";
import { type KeyboardEvent, useCallback, useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/core/utils";
import { type ResponseFile } from "~/types/message";

import { FilePreview } from "./file-preview";
import { FileUpload } from "./file-upload";

interface UploadFile extends Partial<File> {
  id: string;
  isUploadIng: boolean;
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export function ChatInput({
  message,
  setMessage,
  className,
  size,
  responding,
  onSend,
  onCancel,
  placeholder,
  onUpload,
  fetchUpload,
  immediateUpload,
  deleteFile,
}: {
  message: string;
  placeholder?: string;
  setMessage: (message: string) => void;
  className?: string;
  size?: "large" | "normal" | "small";
  responding?: boolean;
  onSend?: (
    message: string,
    options: { deepThinkingMode: boolean; searchBeforePlanning: boolean },
  ) => void;
  onCancel?: () => void;
  onUpload?: (file: File) => void;
  fetchUpload?: (file: File) => Promise<string>;
  immediateUpload?: boolean;
  deleteFile?: (file: ResponseFile) => void;
}) {
  const [deepThinkingMode, setDeepThinkMode] = useState(false);
  const [searchBeforePlanning, setSearchBeforePlanning] = useState(false);
  const [imeStatus, setImeStatus] = useState<"active" | "inactive">("inactive");
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);

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
      if (message.trim() === "" && uploadedFiles.length === 0) {
        return;
      }
      if (onSend) {
        onSend(message, { deepThinkingMode, searchBeforePlanning });
        setMessage("");
        setUploadedFiles([]);
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
    uploadedFiles,
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

  const handleUploadClick = async (file: File) => {
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    };
    const reviewFile: UploadFile = {
      ...fileInfo,
      id: nanoid(),
      isUploadIng: true,
    };
    setUploadedFiles((prev: UploadFile[]) => [...prev, reviewFile]);
    const res = await onUpload?.(file);
    if (res?.success === true) {
      setUploadedFiles((prev: UploadFile[]) =>
        prev.map((f) =>
          f.name === reviewFile.name ? { ...f, isUploadIng: false } : f,
        ),
      );
    } else {
      setUploadedFiles((prev: UploadFile[]) =>
        prev.filter((f) => f.name !== reviewFile.name),
      );
    }
  };

  const handleDeleteFile = async (file: File) => {
    setUploadedFiles((prev: UploadFile[]) =>
      prev.filter((f) => f.name !== file.name),
    );
    deleteFile?.(file);
  };

  return (
    <div className={cn(className)}>
      <div className="flex flex-col overflow-hidden rounded-[24px] border bg-white p-3 shadow-lg">
        <FilePreview files={uploadedFiles ?? []} onRemove={handleDeleteFile} />
        <div className="w-full">
          <textarea
            className={cn(
              "m-0 w-full resize-none border-none text-[15px]",
              size === "large" ? "h-12" : size === "small" ? "h-8" : "min-h-4",
            )}
            placeholder={uploadedFiles.length > 0 ? "添加消息..." : placeholder}
            value={message}
            onCompositionStart={() => setImeStatus("active")}
            onCompositionEnd={() => setImeStatus("inactive")}
            onKeyDown={handleKeyDown}
            onChange={(event) => {
              setMessage(event.target.value);
            }}
          />
        </div>
        <div className="flex flex-shrink-0 justify-between gap-2">
          <FileUpload onUpload={handleUploadClick} disabled={responding} />
          <Button
            className={`h-8 w-8 rounded-full bg-[#37352F14] font-medium ${
              message.length > 0 || responding || uploadedFiles.length > 0
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
    </div>
  );
}
