import { ArrowUp, Square } from "lucide-react";
import { type KeyboardEvent, useCallback, useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/core/utils";

import { FilePreview } from "./file-preview";
import { FileUpload } from "./file-upload";

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
  files,
  deleteFile,
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
  onUpload?: (file: File) => void;
  fetchUpload?: (file: File) => Promise<string>;
  immediateUpload?: boolean;
  files?: File[];
  deleteFile?: (file: File) => void;
}) {
  const [deepThinkingMode, setDeepThinkMode] = useState(false);
  const [searchBeforePlanning, setSearchBeforePlanning] = useState(false);
  const [imeStatus, setImeStatus] = useState<"active" | "inactive">("inactive");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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

  const handleUploadClick = useCallback(
    (file: File) => {
      setUploadedFiles((prev) => [...prev, file]);
      onUpload?.(file);
    },
    [onUpload],
  );

  const handleRemoveFile = useCallback((file: File) => {
    setUploadedFiles((prev) =>
      prev.filter(
        (f) =>
          f.name !== file.name ||
          f.size !== file.size ||
          f.lastModified !== file.lastModified,
      ),
    );
  }, []);

  return (
    <div className={cn(className)}>
      <div className="flex flex-col overflow-hidden rounded-[24px] border bg-white p-3 shadow-lg">
        <FilePreview files={files ?? []} onRemove={deleteFile} />
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
          <FileUpload
            onUpload={handleUploadClick}
            fetchUpload={fetchUpload}
            immediateUpload={immediateUpload}
          />
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
