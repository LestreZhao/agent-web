import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "~/core/utils";

interface MarkdownProps {
  children: string;
  className?: string;
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div
      className={cn("prose prose-sm dark:prose-invert max-w-full", className)}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-2 list-disc pl-4 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal pl-4 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li className="mb-1 last:mb-0">{children}</li>,
          code: ({ children, ...props }) => {
            const match = /language-(\w+)/.exec(props.className || "");
            return !match ? (
              <code
                className="whitespace-pre-wrap break-words rounded bg-gray-100 px-1 py-0.5 font-mono text-sm dark:bg-gray-800"
                {...props}
              >
                {children}
              </code>
            ) : (
              <pre className="overflow-x-s mb-2 mt-2 whitespace-pre-wrap break-words rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                <code className="font-mono text-sm" {...props}>
                  {children}
                </code>
              </pre>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
