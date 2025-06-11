import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, FileIcon, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

import { useMessageStore } from "~/core/store/message";
import { useUIStore } from "~/core/store/ui";
import { cn } from "~/core/utils";
import { type ReviewFile, type ResponseFile } from "~/types/message";

interface FilePreviewProps {
  files: ReviewFile[];
  onRemove?: (file: ReviewFile) => void;
}

export function FilePreview({ files, onRemove }: FilePreviewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // 检查滚动状态
  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
  };

  // 滚动处理
  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 250; // 每次滚动一个文件预览的宽度
    const newScrollLeft =
      scrollContainerRef.current.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };
  if (files.length === 0) return null;

  return (
    <div className="relative mb-2">
      {/* 左滚动按钮 */}
      {showLeftArrow && (
        <button
          onClick={() => handleScroll("left")}
          className="absolute -left-2 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* 右滚动按钮 */}
      {showRightArrow && (
        <button
          onClick={() => handleScroll("right")}
          className="absolute -right-2 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* 文件预览容器 */}
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex gap-2 overflow-x-auto"
        onScroll={() => checkScroll()}
      >
        <AnimatePresence initial={false}>
          {files.map((file: ReviewFile) => (
            <ChatFilePreviewItem
              key={file.id}
              file={file}
              onRemove={onRemove}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ChatFilePreviewItem({
  file,
  onRemove,
  canRemove = true,
  className,
}: {
  file: ReviewFile;
  onRemove?: (file: ResponseFile) => void;
  canRemove?: boolean;
  className?: string;
}) {
  const { setCurrentFile } = useMessageStore();
  const { setIsFilePreview, setExpandTaskView } = useUIStore();
  return (
    <motion.div
      key={file.name}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={() => {
        setCurrentFile(file);
        setIsFilePreview(true);
        setExpandTaskView(true);
      }}
      className={cn(
        "flex w-[250px] shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-[#efefef] p-2 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#37352F14]">
        {file.isUploadIng ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileIcon className="h-4 w-4 text-[#37352F]" />
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <p className="line-clamp-1 w-[165px] cursor-pointer text-ellipsis text-sm font-medium text-[#37352F]">
          {file.name}
        </p>
        <span className="text-xs text-[#37352F80]">
          {formatFileSize(file.size)}
        </span>
      </div>
      {canRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.(file);
          }}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-[#37352F14]"
        >
          <X className="h-4 w-4 text-[#37352F80]" />
        </button>
      )}
    </motion.div>
  );
}

// 将字节转换为可读的文件大小
function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
