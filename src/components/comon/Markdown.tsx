import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "~/core/utils";

interface MarkdownProps {
  children: string;
  className?: string;
}

// 解析表格格式文本的函数
function parseTableText(text: string): { isTable: boolean; tableData?: string[][] } {
  const lines = text.split('\n').filter(line => line.trim());
  
  // 检查是否包含数据库字段表格标题行
  const hasFieldTableHeader = lines.some(line => 
    line.includes('字段名') && line.includes('数据类型') && line.includes('长度') && line.includes('可空') && line.includes('默认值')
  );
  
  // 检查是否包含查询结果表格
  const hasQueryResultHeader = lines.some(line => 
    line.includes('查询结果:') || (line.includes('|') && lines.some(l => l.includes('---')))
  );
  
  if (!hasFieldTableHeader && !hasQueryResultHeader) return { isTable: false };
  
  const tableData: string[][] = [];
  let foundHeader = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 跳过分隔线
    if (trimmedLine.startsWith('---') || trimmedLine.startsWith('===') || trimmedLine.match(/^-+$/)) {
      continue;
    }
    
    // 跳过查询结果标题行
    if (trimmedLine.includes('查询结果:')) {
      continue;
    }
    
    // 检查是否是数据库字段表头
    if (trimmedLine.includes('字段名') && trimmedLine.includes('数据类型')) {
      const headers = trimmedLine.split('|').map(h => h.trim()).filter(h => h);
      tableData.push(headers);
      foundHeader = true;
      continue;
    }
    
    // 检查是否是查询结果表头（包含|分隔符的行）
    if (!foundHeader && trimmedLine.includes('|') && !trimmedLine.includes('字段名')) {
      const headers = trimmedLine.split('|').map(h => h.trim()).filter(h => h);
      if (headers.length >= 2) { // 至少要有2列
        tableData.push(headers);
        foundHeader = true;
        continue;
      }
    }
    
    // 如果找到表头后，解析数据行
    if (foundHeader && trimmedLine.includes('|')) {
      const cells = trimmedLine.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 2) { // 至少要有2列数据
        tableData.push(cells);
      }
    }
  }
  
  return { isTable: tableData.length > 1, tableData };
}

// 渲染表格组件
function TableRenderer({ data }: { data: string[][] }) {
  if (!data || data.length === 0) return null;
  
  const headers = data[0];
  const rows = data.slice(1);
  
  if (!headers) return null;
  
  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-8 py-5 text-left text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600 last:border-r-0"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-sm">
              {row.map((cell, cellIndex) => {
                // 检查是否是数字列，如果是则右对齐
                const isNumeric = /^[\d,.-]+$/.test(cell?.toString() || '');
                return (
                  <td
                    key={cellIndex}
                    className={cn(
                      "px-8 py-5 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-gray-700 last:border-r-0",
                      isNumeric ? "text-right font-mono" : "text-left"
                    )}
                  >
                    {cell || '-'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        "prose prose-base dark:prose-invert max-w-full",
        "prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100",
        "prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed",
        "prose-strong:text-gray-900 dark:prose-strong:text-gray-100",
        "prose-em:text-gray-800 dark:prose-em:text-gray-200",
        "prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20",
        "prose-blockquote:pl-6 prose-blockquote:py-3 prose-blockquote:rounded-r-lg",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => {
            const content = String(children);
            
            // 检测是否包含网页URL
            const urlRegex = /https?:\/\/[^\s"']+/g;
            const urls = content.match(urlRegex);
            
            if (urls && urls.length > 0) {
              return (
                <div className="mb-6 space-y-4">
                  <p className="leading-relaxed text-gray-700 dark:text-gray-300 text-base">{children}</p>
                  {urls.map((url, index) => (
                    <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {url}
                        </a>
                      </div>
                      <iframe
                        src={url}
                        className="w-full h-96 border-0"
                        title={`网页内容 ${index + 1}`}
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                  ))}
                </div>
              );
            }
            
            return <p className="mb-6 leading-relaxed text-gray-700 dark:text-gray-300 last:mb-0 text-base">{children}</p>;
          },
          ul: ({ children }) => (
            <ul className="mb-6 list-disc pl-8 space-y-3 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-6 list-decimal pl-8 space-y-3 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li className="text-gray-700 dark:text-gray-300 leading-relaxed">{children}</li>,
          h1: ({ children }) => <h1 className="text-3xl font-bold mb-6 mt-8 text-gray-900 dark:text-gray-100 first:mt-0 border-b border-gray-200 dark:border-gray-700 pb-3">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-bold mb-5 mt-8 text-gray-900 dark:text-gray-100 first:mt-0 border-b border-gray-100 dark:border-gray-800 pb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-bold mb-4 mt-6 text-gray-900 dark:text-gray-100 first:mt-0">{children}</h3>,
          h4: ({ children }) => <h4 className="text-lg font-bold mb-3 mt-5 text-gray-900 dark:text-gray-100 first:mt-0">{children}</h4>,
          pre: ({ children, ...props }) => {
            const textContent = String(children);
            
            // 检查是否是表格格式的文本
            const { isTable, tableData } = parseTableText(textContent);
            
            if (isTable && tableData) {
              return <TableRenderer data={tableData} />;
            }
            
            return (
              <pre className="overflow-x-auto mb-6 mt-6 whitespace-pre-wrap break-words rounded-xl bg-gray-50 p-6 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-sm" {...props}>
                {children}
              </pre>
            );
          },
          code: ({ children, ...props }) => {
            const match = /language-(\w+)/.exec(props.className || "");
            const textContent = String(children);
            
            // 检查是否是表格格式的文本
            const { isTable, tableData } = parseTableText(textContent);
            
            if (isTable && tableData) {
              return <TableRenderer data={tableData} />;
            }
            
            return !match ? (
              <code
                className="whitespace-pre-wrap break-words rounded-md bg-gray-100 px-3 py-1.5 font-mono text-sm dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                {...props}
              >
                {children}
              </code>
            ) : (
              <pre className="overflow-x-auto mb-6 mt-6 whitespace-pre-wrap break-words rounded-xl bg-gray-50 p-6 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                <code className="font-mono text-sm text-gray-800 dark:text-gray-200" {...props}>
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
