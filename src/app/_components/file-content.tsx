"use client";
import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Document, Page } from "react-pdf";
import rehypeRaw from "rehype-raw";
import { ChatFilePreviewItem } from "./file-preview";
import { TooltipButton } from "~/components/ui/tooltip-button";
import { DownloadIcon, Loader2, XIcon } from "lucide-react";
import { ReviewFile } from "~/types/message";

interface SmartDocumentViewerProps {
  file: ReviewFile;
  onClose: () => void;
}

export default function SmartDocumentViewer({
  file,
  onClose,
}: SmartDocumentViewerProps) {
  const [content, setContent] = React.useState<string>("");
  const [pdfBuffer, setPdfBuffer] = React.useState<ArrayBuffer | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [numPages, setNumPages] = React.useState<number>(1);

  const fileType = file.name.split(".").pop();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(file.url);

        if (!response.ok) {
          throw new Error("Failed to fetch file");
        }

        if (fileType === "pdf") {
          // const buffer = await response.arrayBuffer();
          // setPdfBuffer(buffer);
          setError("暂不支持pdf文件预览，请下载后查看");
        } else {
          const text = await response.text();
          setContent(text);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载文件失败");
      } finally {
        setLoading(false);
      }
    };

    void fetchContent();
  }, [file.url, fileType]);

  return (
    <div className="flex h-full flex-col border-l border-gray-200">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="line-clamp-2 text-sm font-medium">{file.name}</div>
        <div className="flex items-center gap-2">
          <TooltipButton
            tooltip="下载文件"
            variant="ghost"
            className="h-8 w-8 rounded-full border-none"
            onClick={() => {
              const link = document.createElement("a");
              link.href = file.url;
              link.download = file.name;
              link.click();
            }}
          >
            <DownloadIcon className="h-5 w-5" />
          </TooltipButton>
          <TooltipButton
            tooltip="关闭"
            variant="ghost"
            className="h-10 w-10 rounded-full border-none"
            onClick={() => {
              onClose();
            }}
          >
            <XIcon className="h-5 w-5" />
          </TooltipButton>
        </div>
      </div>

      {loading && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="mt-4 text-sm text-gray-500">正在解析文档内容…</p>
        </div>
      )}
      {error && (
        <div className="text-500 flex flex-1 flex-col items-center justify-center">
          <ChatFilePreviewItem
            file={file}
            canRemove={false}
            className="bg-none"
          />
          <p className="mt-4 text-sm text-gray-500">文档解析失败请下载后查看</p>
          <TooltipButton
            tooltip="下载文件"
            variant="ghost"
            className="h-8 w-8 cursor-pointer rounded-full border-none"
            onClick={() => {
              const link = document.createElement("a");
              link.href = file.url;
              link.download = file.name;
              link.click();
            }}
          >
            <DownloadIcon className="h-5 w-5" />
          </TooltipButton>
        </div>
      )}

      <div className="prose prose-sm max-w-full flex-1">
        {fileType === "md" && content && (
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
        )}

        {fileType === "pdf" && (
          <iframe
            src={file.url}
            className="h-full w-full"
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        )}
      </div>
    </div>
  );
}
