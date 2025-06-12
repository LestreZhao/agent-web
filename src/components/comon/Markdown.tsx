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

export function Markdown({ children, className }: MarkdownProps) {
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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // p: ({ children }) => {
          //   // const content = String(children);
          //   // // 检测是否包含网页URL
          //   // const urlRegex = /https?:\/\/[^\s"']+/g;
          //   // const urls = content.match(urlRegex);

          //   // if (urls && urls.length > 0) {
          //   //   return (
          //   //     <div className="mb-2 space-y-2">
          //   //       <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          //   //         {children}
          //   //       </p>
          //   //       {urls.map((url, index) => (
          //   //         <div
          //   //           key={index}
          //   //           className="overflow-hidden rounded-lg dark:border-gray-700"
          //   //         >
          //   //           <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
          //   //             <a
          //   //               href={url}
          //   //               target="_blank"
          //   //               rel="noopener noreferrer"
          //   //               className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          //   //             >
          //   //               {url}
          //   //             </a>
          //   //           </div>
          //   //           <iframe
          //   //             src={url}
          //   //             className="h-96 w-full border-0"
          //   //             title={`网页内容 ${index + 1}`}
          //   //             sandbox="allow-scripts allow-same-origin"
          //   //           />
          //   //         </div>
          //   //       ))}
          //   //     </div>
          //   //   );
          //   // }
          //   return (
          //     <p className="mb-2 text-base leading-relaxed text-gray-700 last:mb-0 dark:text-gray-300">
          //       {children}
          //     </p>
          //   );
          // },
          pre: ({ children, ...props }) => {
            return (
              <pre
                className="my-2 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-gray-100 p-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
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
              <table className="w-full rounded rounded-xl border border-gray-100 text-center">
                {children}
              </table>
            );
          },
          tr: ({ children }) => {
            return <tr className="border border-gray-300">{children}</tr>;
          },
          td: ({ children }) => {
            return (
              <td className="border border-gray-300 bg-white px-2 py-2">
                {children}
              </td>
            );
          },
          th: ({ children }) => {
            return (
              <th className="border border-gray-300 bg-gray-100 p-2">
                {children}
              </th>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
