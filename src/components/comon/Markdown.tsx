import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { cn } from "~/core/utils";

import "highlight.js/styles/atom-one-dark.css";
import CopyButton from "../ui/copy-button";

interface MarkdownProps {
  children: string;
  className?: string;
}

export const Markdown = memo(function Markdown({
  children,
  className,
}: MarkdownProps) {
  const render = useMemo(() => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ children, ...props }) => {
            return (
              <pre
                className="my-2 max-w-full whitespace-pre-wrap break-words rounded-lg bg-gray-100 p-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                {...props}
              >
                {children}
              </pre>
            );
          },
          code: ({ children, className, ...props }) => {
            const language = className?.split("-")[1];
            if (language === "sql") {
              const id = Math.random().toString(36).substring(2, 9);
              return (
                <div
                  className="not-prose relative rounded-md bg-gray-100 px-2 text-sm text-gray-800 dark:text-gray-200"
                  {...props}
                >
                  <span id={id}>{children}</span>
                  {language === "sql" && (
                    <CopyButton id={id} className="absolute right-0 top-0" />
                  )}
                </div>
              );
            } else {
              return (
                <code
                  className="text-s relative py-1 text-gray-800 dark:text-gray-200"
                  {...props}
                >
                  {children}
                </code>
              );
            }
          },
          h1: ({ children }) => {
            return <h1 className="mb-4 text-3xl font-bold">{children}</h1>;
          },
          table: ({ children }) => {
            return (
              <table className="mt-4 w-full overflow-hidden rounded-lg border border-[#eef2f9] text-center">
                {children}
              </table>
            );
          },
          tr: ({ children }) => {
            return (
              <tr className="whitespace-pre-wrap border border-[#eef2f9]">
                {children}
              </tr>
            );
          },
          td: ({ children }) => {
            return (
              <td className="whitespace-pre-wrap border border-[#eef2f9] bg-white px-2 py-2">
                {children}
              </td>
            );
          },
          th: ({ children }) => {
            return (
              <th className="whitespace-pre-wrap border border-[#eef2f9] bg-gray-100 p-2">
                {children}
              </th>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    );
  }, [children]);
  return (
    <div
      className={cn(
        "prose prose-base dark:prose-invert max-w-full overflow-x-auto",
        "prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100",
        "prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed",
        "prose-strong:text-gray-900 dark:prose-strong:text-gray-100",
        "prose-em:text-gray-800 dark:prose-em:text-gray-200",
        "prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20",
        "prose-blockquote:pl-6 prose-blockquote:py-3 prose-blockquote:rounded-r-lg",
        className,
      )}
    >
      {render}
    </div>
  );
});
