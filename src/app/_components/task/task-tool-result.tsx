import { GlobalOutlined, PythonOutlined } from "@ant-design/icons";
import { LRUCache } from "lru-cache";
import { useMemo } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

import { Markdown } from "~/components/comon/Markdown";
import { type ToolCallTask } from "~/core/workflow";

export function TaskToolResultView({ task }: { task: ToolCallTask }) {
  if (task.type === "thinking" && task.agentName === "planner") {
    return <PlanTaskView task={task} />;
  } else if (task.type === "thinking") {
    return <Markdown className="text-sm">{task.payload.text}</Markdown>;
  }
  if (task.payload.toolName === "tavily_search") {
    return <TravilySearchToolCallView task={task as ToolCallTask<any>} />;
  } else if (task.payload.toolName === "crawl_tool") {
    return <CrawlToolCallView task={task as ToolCallTask<any>} />;
  } else if (task.payload.toolName === "browser") {
    return <BrowserToolCallView task={task as ToolCallTask<any>} />;
  } else if (task.payload.toolName === "python_repl_tool") {
    return <PythonReplToolCallView task={task as ToolCallTask<any>} />;
  } else if (task.payload.toolName === "bash_tool") {
    return <BashToolCallView task={task as ToolCallTask<any>} />;
  } else if (task.payload.toolName === "generate_echarts_chart") {
    return <GenerateEchartsChartView task={task as ToolCallTask<any>} />;
  } else if (
    task.payload.toolName === "execute_oracle_query" ||
    task.payload.toolName === "get_table_info" ||
    task.payload.toolName === "get_table_relationships"
  ) {
    const search =
      task.payload.toolName === "execute_oracle_query"
        ? (task.payload.input as any).sql
        : "查询的表名：\n" + (task.payload.input as any).table_name;
    const content =
      "执行的sql语句：\n```sql\n" +
      search +
      "\n```\n" +
      `执行结果：\n \`\`\`json\n${task.payload.output}\n\`\`\``;
    return <Markdown className="text-sm">{content}</Markdown>;
  }
  return <div>{task.payload.toolName}</div>;
}

// 执行浏览器
function BrowserToolCallView({
  task,
}: {
  task: ToolCallTask<{ instruction: string }>;
}) {
  return (
    <div className="flex items-center gap-2">
      <div>
        <GlobalOutlined className="h-4 w-4 text-sm" />
      </div>
      <div>
        <span className="text-sm">{task.payload.input.instruction}</span>
      </div>
    </div>
  );
}

// 执行计划
function PlanTaskView({ task }: { task: any }) {
  const plan = useMemo<{
    title?: string;
    steps?: { title?: string; description?: string }[];
  }>(() => {
    if (task.payload.text && task.state === "success") {
      return JSON.parse(
        task.payload.text.replace(/```json/g, "").replace(/```/g, ""),
      );
    }
    return {};
  }, [task]);
  const markdown = `## ${plan.title ?? ""}\n\n${plan.steps?.map((step) => `- **${step.title ?? ""}**\n\n${step.description ?? ""}`).join("\n\n") ?? ""}`;
  return (
    <li key={task.id} className="flex flex-col">
      <div>
        <Markdown className="pl-6">{markdown ?? ""}</Markdown>
      </div>
    </li>
  );
}

// 爬取网页
const pageCache = new LRUCache<string, string>({ max: 100 });
function CrawlToolCallView({ task }: { task: ToolCallTask<{ url: string }> }) {
  const title = useMemo(() => {
    return pageCache.get(task.payload.input.url);
  }, [task.payload.input.url]);
  
  // 检测文件类型
  const fileType = useMemo(() => {
    const url = task.payload.input.url.toLowerCase();
    if (url.includes('.pdf')) return 'pdf';
    if (url.includes('.md') || url.includes('.markdown')) return 'markdown';
    if (url.includes('.txt')) return 'text';
    if (url.includes('.doc') || url.includes('.docx')) return 'document';
    if (url.includes('.xls') || url.includes('.xlsx')) return 'spreadsheet';
    if (url.includes('.ppt') || url.includes('.pptx')) return 'presentation';
    if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp')) return 'image';
    if (url.includes('.mp4') || url.includes('.avi') || url.includes('.mov') || url.includes('.webm')) return 'video';
    return 'webpage';
  }, [task.payload.input.url]);
  
  return (
    <div>
      {/* <div className="flex items-center gap-2 mb-4">
        <div>
          <GlobalOutlined className="h-4 w-4 text-sm" />
        </div>
        <div>
          <span>正在浏览</span>{" "}
          <a
            className="text-sm font-bold text-blue-600 hover:underline"
            href={task.payload.input.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {title ?? task.payload.input.url}
          </a>
        </div>
      </div> */}
      
      {task.payload.output && task.state === "success" && (
        <div className="space-y-4">
          {/* 网页预览 */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg bg-white dark:bg-gray-900">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 flex items-center justify-center gap-2">
                  {fileType === 'pdf' && <span className="text-red-500">📄</span>}
                  {fileType === 'markdown' && <span className="text-blue-600">📝</span>}
                  {fileType === 'text' && <span className="text-gray-600">📄</span>}
                  {fileType === 'image' && <span className="text-green-500">🖼️</span>}
                  {fileType === 'video' && <span className="text-purple-500">🎥</span>}
                  {fileType === 'document' && <span className="text-blue-500">📄</span>}
                  {fileType === 'spreadsheet' && <span className="text-green-600">📊</span>}
                  {fileType === 'presentation' && <span className="text-orange-500">📋</span>}
                  {fileType === 'webpage' && <GlobalOutlined className="h-4 w-4 text-gray-500" />}
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-mono truncate">
                    {task.payload.input.url}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 内容显示区域 */}
            <div className="w-full">
              {fileType === 'pdf' && (
                <iframe
                  src={task.payload.input.url}
                  className="w-full h-[600px] border-0"
                  title="PDF预览"
                />
              )}
              
              {(fileType === 'markdown' || fileType === 'text') && (
                <iframe
                  src={task.payload.input.url}
                  className="w-full min-h-[400px] h-[80vh] max-h-[800px] border-0 bg-white"
                  title={fileType === 'markdown' ? 'Markdown预览' : '文本预览'}
                />
              )}
              
              {fileType === 'image' && (
                <div className="flex justify-center p-4">
                  <img
                    src={task.payload.input.url}
                    alt="图片预览"
                    className="max-w-full max-h-[600px] object-contain rounded-lg shadow-sm"
                  />
                </div>
              )}
              
              {fileType === 'video' && (
                <video
                  src={task.payload.input.url}
                  className="w-full h-[600px] object-contain"
                  controls
                  preload="metadata"
                >
                  您的浏览器不支持视频播放
                </video>
              )}
              
              {(fileType === 'document' || fileType === 'spreadsheet' || fileType === 'presentation') && (
                <div className="flex flex-col items-center justify-center h-[600px] bg-gray-50 dark:bg-gray-800">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">
                      {fileType === 'document' && '📄'}
                      {fileType === 'spreadsheet' && '📊'}
                      {fileType === 'presentation' && '📋'}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {fileType === 'document' && 'Word文档'}
                      {fileType === 'spreadsheet' && 'Excel表格'}
                      {fileType === 'presentation' && 'PowerPoint演示文稿'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      浏览器无法直接预览此文件类型
                    </p>
                    <a
                      href={task.payload.input.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      下载文件
                    </a>
                  </div>
                </div>
              )}
              
              {fileType === 'webpage' && (
                <iframe
                  src={task.payload.input.url}
                  className="w-full min-h-[400px] h-[80vh] max-h-[800px] border-0"
                  title="网页预览"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              )}
            </div>
            
            {/* 底部操作栏 */}
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600 dark:text-gray-400">
                  {fileType === 'pdf' && 'PDF文档'}
                  {fileType === 'markdown' && 'Markdown文档'}
                  {fileType === 'text' && '文本文件'}
                  {fileType === 'image' && '图片文件'}
                  {fileType === 'video' && '视频文件'}
                  {fileType === 'document' && 'Word文档'}
                  {fileType === 'spreadsheet' && 'Excel表格'}
                  {fileType === 'presentation' && 'PowerPoint演示文稿'}
                  {fileType === 'webpage' && '网页'}
                </div>
                <a
                  href={task.payload.input.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {fileType === 'webpage' ? '在新窗口打开' : 
                   fileType === 'image' || fileType === 'video' || fileType === 'pdf' ? '在新窗口查看' : 
                   '下载文件'} →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 执行搜索
function TravilySearchToolCallView({
  task,
}: {
  task: ToolCallTask<{ query: string }>;
}) {
  const results = useMemo(() => {
    try {
      const results = JSON.parse(task.payload.output ?? "") ?? [];
      results.forEach((result: { url: string; title: string }) => {
        pageCache.set(result.url, result.title);
      });
      return results;
    } catch (error) {
      return [];
    }
  }, [task.payload.output]);
  return (
    <div className="w-full">
      {task.state !== "pending" && (
        <div className="flex flex-col gap-4 pt-4">
          <ul className="flex flex-col gap-4">
            {results.map((result: { url: string; title: string }) => (
              <li
                key={result.url}
                className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <a
                  className="flex items-start gap-3 text-gray-900 hover:text-blue-600"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={result.url}
                >
                  <img
                    className="mt-1 h-5 w-5 rounded-full bg-slate-100 shadow-sm"
                    src={new URL(result.url).origin + "/favicon.ico"}
                    alt={result.title}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://perishablepress.com/wp/wp-content/images/2021/favicon-standard.png";
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium leading-relaxed">{result.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600 leading-relaxed">
                      {(result as any).content || ''}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// 执行python代码
function PythonReplToolCallView({
  task,
}: {
  task: ToolCallTask<{ code: string }>;
}) {
  return (
    <div className="h-full w-full">
      <div className="flex items-center gap-2">
        <div>
          <PythonOutlined className="h-4 w-4 text-sm" />
        </div>
        <div>
          <span>正在编写和执行Python代码</span>
        </div>
      </div>
      {task.payload.input.code && (
        <div className="min-w[640px] mx-4 mt-2 max-h-full max-w-full overflow-auto rounded-lg border bg-gray-50 p-2">
          <SyntaxHighlighter language="python" style={docco}>
            {task.payload.input.code}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}

// 执行bash命令
function BashToolCallView({ task }: { task: ToolCallTask<{ cmd: string }> }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <div>
          <PythonOutlined className="h-4 w-4 text-sm" />
        </div>
        <div>
          <span>
            Executing <a className="font-medium">Bash Command</a>
          </span>
        </div>
      </div>
      {task.payload.input.cmd && (
        <div
          className="min-w[640px] mx-4 mt-2 max-h-[420px] max-w-[640px] overflow-auto rounded-lg border bg-gray-50 p-2"
          style={{ fontSize: "smaller" }}
        >
          <SyntaxHighlighter language="bash" style={docco}>
            {task.payload.input.cmd}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}

// ECharts图表生成工具视图
function GenerateEchartsChartView({ task }: { task: ToolCallTask<any> }) {
  const { chartConfig, originalData } = useMemo(() => {
    try {
      if (task.payload.output && task.state === "success") {
        const output = JSON.parse(task.payload.output);
        return {
          chartConfig: output.chart_config || output,
          originalData: output
        };
      }
      return { chartConfig: null, originalData: null };
    } catch (error) {
      console.error("解析图表数据失败:", error);
      return { chartConfig: null, originalData: null };
    }
  }, [task.payload.output, task.state]);

  if (!chartConfig && !originalData) {
    return (
      <div className="flex items-center gap-2">
        <div>
          <GlobalOutlined className="h-4 w-4 text-sm" />
        </div>
        <div>
          <span>正在生成图表...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm bg-white dark:bg-gray-900">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">📊</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {chartConfig?.title?.text || originalData?.chart_title || "ECharts图表"}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {originalData?.chart_type?.toUpperCase() || 'ECharts'}配置
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {/* 生成状态 */}
          {originalData?.success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  图表配置生成成功
                </span>
              </div>
            </div>
          )}

          {/* ECharts图表预览区域 */}
          <div className="mb-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border-2 border-dashed border-blue-200 dark:border-gray-600">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <div className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                {originalData?.chart_type?.toUpperCase() || 'ECharts'}图表配置已生成
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                图表类型: {originalData?.chart_type || chartConfig?.series?.[0]?.type || '未知'}
              </div>
              {originalData?.data_summary && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  数据记录: {originalData.data_summary.records_count} 条
                </div>
              )}
            </div>
          </div>

          {/* 图表配置详情 */}
          <div className="space-y-4">
            {/* 基本信息 */}
            {chartConfig && (chartConfig.title || chartConfig.legend || chartConfig.tooltip) && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">基本配置</h4>
                <div className="space-y-2 text-sm">
                  {chartConfig.title && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">标题: </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {typeof chartConfig.title === 'string' ? chartConfig.title : chartConfig.title.text}
                      </span>
                    </div>
                  )}
                  {chartConfig.tooltip && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">提示框: </span>
                      <span className="text-gray-800 dark:text-gray-200">已启用</span>
                    </div>
                  )}
                  {chartConfig.legend && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">图例: </span>
                      <span className="text-gray-800 dark:text-gray-200">已配置</span>
                    </div>
                  )}
                  {chartConfig.toolbox && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">工具箱: </span>
                      <span className="text-gray-800 dark:text-gray-200">已启用</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 数据系列 */}
            {chartConfig?.series && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">数据系列</h4>
                <div className="space-y-2">
                  {chartConfig.series.map((series: any, index: number) => (
                    <div key={index} className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">系列 {index + 1}: </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {series.name || '未命名'} ({series.type || '未知类型'})
                      </span>
                      {series.data && (
                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                          - {Array.isArray(series.data) ? series.data.length : 0} 个数据点
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 数据摘要 */}
            {originalData?.data_summary && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">数据摘要</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">记录数量: </span>
                    <span className="text-gray-800 dark:text-gray-200">{originalData.data_summary.records_count}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">字段数量: </span>
                    <span className="text-gray-800 dark:text-gray-200">{originalData.data_summary.columns?.length || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 完整配置 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">完整ECharts配置</h4>
              <div className="bg-gray-900 rounded p-3 overflow-auto max-h-96">
                <pre className="text-xs text-green-400 whitespace-pre-wrap">
                  {JSON.stringify(chartConfig || originalData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
