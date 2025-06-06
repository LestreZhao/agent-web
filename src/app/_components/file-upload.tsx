import { FolderUp, Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { TooltipButton } from "~/components/ui/tooltip-button";
import { type ResponseFile } from "~/types/message";

interface FileUploadProps {
  onUpload?: (file: File) => void;
  maxFiles?: number;
  accept?: string;
  // 上传文件的接口，如果为空，则不进行上传
  fetchUpload?: (file: File) => Promise<string>;
  fetchUploadCallback?: (file: File, result: ResponseFile) => void;
  // 是否立即上传，如果为false，则需要手动调用fetchUpload
  immediateUpload?: boolean;
}

export function FileUpload({
  onUpload,
  maxFiles = 5,
  accept = ".doc,.docx,.pdf",
  fetchUpload,
  fetchUploadCallback,
  immediateUpload = true,
  disabled = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);

      // 验证文件数量
      if (files.length > maxFiles) {
        alert(`一次最多只能上传${maxFiles}个文件`);
        return;
      }

      for (const file of files) {
        // 验证文件类型
        const fileType = file.name.split(".").pop()?.toLowerCase();
        if (!fileType || !accept.includes(fileType)) {
          alert("只支持 Word 和 PDF 文件");
          return;
        }

        // 验证文件大小（限制为20MB）
        const maxSize = 20 * 1024 * 1024; // 20MB in bytes
        if (file.size > maxSize) {
          alert("文件大小不能超过20MB");
          return;
        }

        if (fetchUpload && immediateUpload) {
          setUploading(true);
          const result = await fetchUpload(file)
            .then((result) => {
              return result;
            })
            .catch((error) => {
              console.error(error);
              toast.error("上传失败");
              return null;
            })
            .finally(() => {
              setUploading(false);
            });
          if (result) {
            fetchUploadCallback?.(file, result);
          }
        } else {
          onUpload?.(file);
        }
      }

      // 重置input的value，这样相同文件可以重复上传
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [
      onUpload,
      maxFiles,
      fetchUpload,
      immediateUpload,
      accept,
      fetchUploadCallback,
    ],
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".doc,.docx,.pdf"
        disabled={disabled}
        onChange={handleFileUpload}
        multiple
        className="hidden"
      />
      <TooltipButton
        tooltip="上传文件"
        tooltipSide="top"
        tooltipAlign="center"
        variant="outline"
        className="h-8 w-8 rounded-full"
        onClick={handleUploadClick}
        disabled={uploading || disabled}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FolderUp className="h-4 w-4" />
        )}
      </TooltipButton>
    </>
  );
}
