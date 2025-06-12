import { Copy, Check } from "lucide-react";
import { useState } from "react";

import { cn } from "~/core/utils";

export const CopyButton = ({
  id,
  className,
}: {
  id: string;
  className?: string;
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      // 首选 Clipboard API
      return navigator.clipboard.writeText(text);
    } else {
      // 后备方案：创建临时文本区域
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const success = document.execCommand("copy");
        textArea.remove();
        if (success) {
          return Promise.resolve();
        } else {
          throw new Error("复制命令执行失败");
        }
      } catch (error) {
        textArea.remove();
        return Promise.reject(
          new Error(error instanceof Error ? error.message : "复制失败"),
        );
      }
    }
  };

  const onCopy = async () => {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`找不到ID为 ${id} 的元素`);
      return;
    }

    try {
      const text = element.innerText;
      await copyToClipboard(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("复制失败:", error);
    }
  };

  return (
    <button
      onClick={onCopy}
      title={copied ? "已复制!" : "点击复制"}
      className={cn(
        "inline-flex rounded-md p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800",
        "transition-all duration-200 ease-in-out",
        className,
      )}
    >
      <Copy
        size={16}
        className={cn(
          "transition-all duration-200",
          copied ? "scale-0" : "scale-100",
        )}
      />
      <Check
        size={16}
        className={cn(
          "absolute transition-all duration-200",
          copied ? "scale-100" : "scale-0",
        )}
      />
    </button>
  );
};

export default CopyButton;
