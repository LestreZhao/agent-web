"use client";
import { DownloadIcon, Loader2, XIcon } from "lucide-react";
import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import { TooltipButton } from "~/components/ui/tooltip-button";
import { type ReviewFile } from "~/types/message";

import { ChatFilePreviewItem } from "./file-preview";

interface SmartDocumentViewerProps {
  file: ReviewFile;
  onClose: () => void;
}

export default function SmartDocumentViewer({
  file,
  onClose,
}: SmartDocumentViewerProps) {
  const [content, setContent] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 获取文件扩展名并转换为小写
  const fileType = file.name.split(".").pop()?.toLowerCase();
  // 标准化文件类型（将markdown扩展名也映射为md）
  const normalizedFileType = fileType === "markdown" ? "md" : fileType;

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);

        // 检查文件URL是否是Mac本地路径或file:///开头的路径
        const isMacPath =
          file.url.startsWith("/Users/") ||
          file.url.startsWith("file:///Users/");

        let fileUrl = file.url;
        let response;

        // 如果是Mac路径，通过API路由获取文件内容
        if (isMacPath) {
          // 提取实际文件路径（如果是file:///格式，去掉前缀）
          const actualPath = file.url.replace(/^file:\/\//, "");
          // 调用API路由
          response = await fetch(
            `/api/file?path=${encodeURIComponent(actualPath)}`,
          );
        } else {
          // 如果不是本地文件，正常fetch
          response = await fetch(fileUrl);
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        if (normalizedFileType === "pdf") {
          // const buffer = await response.arrayBuffer();
          // setPdfBuffer(buffer);
          setError("暂不支持pdf文件预览，请下载后查看");
        } else {
          const text = await response.text();
          setContent(text);
        }
      } catch (err) {
        console.error("File fetch error:", err);
        setError(err instanceof Error ? err.message : "加载文件失败");
      } finally {
        setLoading(false);
      }
    };

    void fetchContent();
  }, [file.url, normalizedFileType]);

  return (
    <div className="flex h-full flex-col rounded-lg border-b border-l border-gray-200">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="line-clamp-2 text-sm font-medium">{file.name}</div>
        <div className="flex items-center gap-2">
          <TooltipButton
            tooltip="下载文件"
            variant="ghost"
            className="h-8 w-8 rounded-full border-none"
            onClick={() => {
              // 检查是否是Mac本地路径或file:///开头的路径
              const isMacPath =
                file.url.startsWith("/Users/") ||
                file.url.startsWith("file:///Users/");

              if (isMacPath) {
                // 提取实际文件路径
                const actualPath = file.url.replace(/^file:\/\//, "");
                // 使用API路由下载
                window.open(
                  `/api/file?path=${encodeURIComponent(actualPath)}`,
                  "_blank",
                );
              } else {
                // 如果不是本地文件，正常下载
                const link = document.createElement("a");
                link.href = file.url;
                link.download = file.name;
                link.click();
              }
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
              // 检查是否是Mac本地路径或file:///开头的路径
              const isMacPath =
                file.url.startsWith("/Users/") ||
                file.url.startsWith("file:///Users/");

              if (isMacPath) {
                // 提取实际文件路径
                const actualPath = file.url.replace(/^file:\/\//, "");
                // 使用API路由下载
                window.open(
                  `/api/file?path=${encodeURIComponent(actualPath)}`,
                  "_blank",
                );
              } else {
                // 如果不是本地文件，正常下载
                const link = document.createElement("a");
                link.href = file.url;
                link.download = file.name;
                link.click();
              }
            }}
          >
            <DownloadIcon className="h-5 w-5" />
          </TooltipButton>
        </div>
      )}

      <div className="prose prose-sm max-w-full flex-1 overflow-auto p-6">
        {normalizedFileType === "md" && content && (
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ node, ...props }) => (
                <h1
                  className="mb-4 mt-6 border-b pb-2 text-2xl font-bold"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="mb-3 mt-5 text-xl font-bold" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="mb-2 mt-4 text-lg font-bold" {...props} />
              ),
              h4: ({ node, ...props }) => (
                <h4 className="mb-2 mt-3 text-base font-bold" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="my-3 leading-relaxed" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="my-3 list-disc space-y-2 pl-6" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="my-3 list-decimal space-y-2 pl-6" {...props} />
              ),
              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
              table: ({ node, ...props }) => (
                <div className="my-4 overflow-x-auto">
                  <table
                    className="min-w-full border-collapse border border-gray-300"
                    {...props}
                  />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th
                  className="border border-gray-300 bg-gray-100 px-4 py-2 text-left dark:bg-gray-700"
                  {...props}
                />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-gray-300 px-4 py-2" {...props} />
              ),
              code: ({ node, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match;
                return isInline ? (
                  <code
                    className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm dark:bg-gray-800"
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <pre className="my-4 overflow-x-auto rounded bg-gray-100 p-4 font-mono text-sm dark:bg-gray-800">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        )}

        {normalizedFileType === "pdf" && (
          <iframe
            src={
              file.url.startsWith("/Users/") ||
              file.url.startsWith("file:///Users/")
                ? `/api/file?path=${encodeURIComponent(file.url.replace(/^file:\/\//, ""))}`
                : file.url
            }
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
