import { GlobalOutlined, PythonOutlined } from "@ant-design/icons";
import * as echarts from "echarts";
import { LRUCache } from "lru-cache";
import { Loader2, LoaderCircle } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useCallback } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

import { Markdown } from "~/components/comon/Markdown";
import { cn } from "~/core/utils";
import {
  convertToMarkdownTable,
  parseTableText,
} from "~/core/utils/oracleTable";
import { type ToolCallTask } from "~/core/workflow";

import { ReportTaskView } from "../messages/messages-task-view";
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
    if (url.includes(".pdf")) return "pdf";
    if (url.includes(".md") || url.includes(".markdown")) return "markdown";
    if (url.includes(".txt")) return "text";
    if (url.includes(".doc") || url.includes(".docx")) return "document";
    if (url.includes(".xls") || url.includes(".xlsx")) return "spreadsheet";
    if (url.includes(".ppt") || url.includes(".pptx")) return "presentation";
    if (
      url.includes(".jpg") ||
      url.includes(".jpeg") ||
      url.includes(".png") ||
      url.includes(".gif") ||
      url.includes(".webp")
    )
      return "image";
    if (
      url.includes(".mp4") ||
      url.includes(".avi") ||
      url.includes(".mov") ||
      url.includes(".webm")
    )
      return "video";
    return "webpage";
  }, [task.payload.input.url]);

  return (
    <div>
      {task.payload.output && task.state === "success" && (
        <div className="space-y-4">
          {/* 网页预览 */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 dark:border-gray-600 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex flex-1 items-center justify-center gap-2">
                  {fileType === "pdf" && (
                    <span className="text-red-500">📄</span>
                  )}
                  {fileType === "markdown" && (
                    <span className="text-blue-600">📝</span>
                  )}
                  {fileType === "text" && (
                    <span className="text-gray-600">📄</span>
                  )}
                  {fileType === "image" && (
                    <span className="text-green-500">🖼️</span>
                  )}
                  {fileType === "video" && (
                    <span className="text-purple-500">🎥</span>
                  )}
                  {fileType === "document" && (
                    <span className="text-blue-500">📄</span>
                  )}
                  {fileType === "spreadsheet" && (
                    <span className="text-green-600">📊</span>
                  )}
                  {fileType === "presentation" && (
                    <span className="text-orange-500">📋</span>
                  )}
                  {fileType === "webpage" && (
                    <GlobalOutlined className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="truncate font-mono text-sm text-gray-600 dark:text-gray-300">
                    {task.payload.input.url}
                  </span>
                </div>
              </div>
            </div>

            {/* 内容显示区域 */}
            <div className="w-full">
              {fileType === "pdf" && (
                <iframe
                  src={task.payload.input.url}
                  className="h-[600px] w-full border-0"
                  title="PDF预览"
                />
              )}

              {(fileType === "markdown" || fileType === "text") && (
                <iframe
                  src={task.payload.input.url}
                  className="h-[80vh] max-h-[800px] min-h-[400px] w-full border-0 bg-white"
                  title={fileType === "markdown" ? "Markdown预览" : "文本预览"}
                />
              )}

              {fileType === "image" && (
                <div className="flex justify-center p-4">
                  <img
                    src={task.payload.input.url}
                    alt="图片预览"
                    className="max-h-[600px] max-w-full rounded-lg object-contain shadow-sm"
                  />
                </div>
              )}

              {fileType === "video" && (
                <video
                  src={task.payload.input.url}
                  className="h-[600px] w-full object-contain"
                  controls
                  preload="metadata"
                >
                  您的浏览器不支持视频播放
                </video>
              )}

              {(fileType === "document" ||
                fileType === "spreadsheet" ||
                fileType === "presentation") && (
                <div className="flex h-[600px] flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
                  <div className="p-8 text-center">
                    <div className="mb-4 text-6xl">
                      {fileType === "document" && "📄"}
                      {fileType === "spreadsheet" && "📊"}
                      {fileType === "presentation" && "📋"}
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                      {fileType === "document" && "Word文档"}
                      {fileType === "spreadsheet" && "Excel表格"}
                      {fileType === "presentation" && "PowerPoint演示文稿"}
                    </h3>
                    <p className="mb-4 text-gray-600 dark:text-gray-400">
                      浏览器无法直接预览此文件类型
                    </p>
                    <a
                      href={task.payload.input.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                      下载文件
                    </a>
                  </div>
                </div>
              )}

              {fileType === "webpage" && (
                <iframe
                  src={task.payload.input.url}
                  className="h-[80vh] max-h-[800px] min-h-[400px] w-full border-0"
                  title="网页预览"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              )}
            </div>

            {/* 底部操作栏 */}
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-800">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600 dark:text-gray-400">
                  {fileType === "pdf" && "PDF文档"}
                  {fileType === "markdown" && "Markdown文档"}
                  {fileType === "text" && "文本文件"}
                  {fileType === "image" && "图片文件"}
                  {fileType === "video" && "视频文件"}
                  {fileType === "document" && "Word文档"}
                  {fileType === "spreadsheet" && "Excel表格"}
                  {fileType === "presentation" && "PowerPoint演示文稿"}
                  {fileType === "webpage" && "网页"}
                </div>
                <a
                  href={task.payload.input.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  {fileType === "webpage"
                    ? "在新窗口打开"
                    : fileType === "image" ||
                        fileType === "video" ||
                        fileType === "pdf"
                      ? "在新窗口查看"
                      : "下载文件"}{" "}
                  →
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
        <div className="flex flex-col gap-2">
          <ul className="flex flex-col gap-2">
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
                    <h3 className="font-medium leading-relaxed">
                      {result.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {(result as any).content ?? ""}
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
export function GenerateEchartsChartView({
  task,
}: {
  task: ToolCallTask<any>;
}) {
  if (task.state !== "success") {
    return (
      <div className="flex items-center justify-center gap-2 text-sm">
        <div>
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
        <div>
          <span>正在生成图表...</span>
        </div>
      </div>
    );
  }
  const chartsData = useMemo(() => {
    try {
      let jsonData;
      const text = task.payload.output ?? task.payload.text;
      if (text && task.state === "success") {
        jsonData = JSON.parse(text.replace(/```json/g, "").replace(/```/g, ""));
      } else {
        return [];
      }
      // 处理多图表数据格式
      if (Array.isArray(jsonData)) {
        return jsonData;
      } else if (jsonData.charts && Array.isArray(jsonData.charts)) {
        return jsonData.charts;
      } else if (jsonData.chart_type && jsonData.data) {
        return [
          {
            chart_type: jsonData.chart_type,
            chart_data: {
              series: [
                {
                  name: jsonData.y_axis_name,
                  data: jsonData.data.map((item: any) => item.y),
                },
              ],
              x_axis: {
                name: jsonData.x_axis_name,
              },
              y_axis: {
                name: jsonData.y_axis_name,
              },
            },
          },
        ];
      } else if (jsonData.chart_type && jsonData.chart_data) {
        return [jsonData];
      }
      return [];
    } catch (error) {
      console.error("解析图表数据失败:", error);
      return [];
    }
  }, [task.payload, task.state]);

  return (
    <div className="w-full space-y-4">
      {chartsData.map((chart: any, index: number) => (
        <ChartCard key={`${task.id}_${index}`} chart={chart} />
      ))}
    </div>
  );
}
// 单个图表卡片组件
export const ChartCard = memo(function ChartCard({
  chart,
  resize,
  className,
}: {
  chart: any;
  resize?: boolean;
  className?: string;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const chartOption = useMemo(() => {
    const chartData = chart.chart_data;
    if (!chartData) return null;
    const baseOption = {
      ...chartData,
      animation: false, // 禁用动画以提高性能
      legend: {
        ...chartData?.legend,
        top: "95%",
      },
      grid: {
        bottom: "5%",
        containLabel: true,
      },
    };
    if ("grid" in chartData) {
      delete baseOption.grid;
    }
    return baseOption;
  }, [chart]);

  const description = chart.description ?? "";

  // 初始化和更新图表
  useEffect(() => {
    const initChart = () => {
      if (!chartRef.current || !chartOption) return;
      const { clientWidth, clientHeight } = chartRef.current;
      if (clientWidth === 0 || clientHeight === 0) return;
      try {
        // 初始化新实例
        chartInstance.current = echarts.init(chartRef.current, undefined, {
          renderer: "canvas",
          devicePixelRatio: window.devicePixelRatio,
          useDirtyRect: true,
        });
        chartInstance.current.setOption(chartOption);
      } catch (error) {
        console.error("图表初始化失败:", error);
      }
    };

    // 使用 ResizeObserver 监听容器大小变化
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }
    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          if (chartInstance.current) {
            chartInstance.current.resize();
          } else {
            initChart();
          }
        }
      }
    });

    if (chartRef.current) {
      if (resize) {
        resizeObserverRef.current.observe(chartRef.current);
      }
      initChart();
    }

    // 清理函数
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = undefined;
      }
    };
  }, [chartOption, resize]);

  // 处理滚轮事件
  const handleWheel = useCallback(() => {
    // 空函数，只是为了标记事件为 passive
  }, []);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900",
        className,
      )}
    >
      <div className="p-4">
        {/* 图表容器 */}
        <div
          ref={chartRef}
          onWheel={handleWheel}
          style={{
            width: "100%",
            height: "450px",
          }}
        />
        {description && (
          <Markdown className="mt-2 rounded-lg border bg-gray-50 p-4 text-sm text-gray-500">
            {description}
          </Markdown>
        )}
      </div>
    </div>
  );
});

function AnalyzeDocumentContentToolCallView({
  task,
}: {
  task: ToolCallTask<any>;
}) {
  const documentData = useMemo(() => {
    try {
      if (task.payload.output) {
        const data = JSON.parse(task.payload.output);
        return data.data;
      }
      return null;
    } catch (error) {
      console.error("解析文档数据失败:", error);
      return null;
    }
  }, [task.payload.output]);

  if (!documentData) {
    return <div>无法解析文档数据</div>;
  }
  return (
    <div className="space-y-4">
      {/* 文档基本信息 */}
      <div className="rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="my-4 text-center text-gray-900 dark:text-gray-100">
          {documentData.document_info.filename}
        </div>
        <div className="mb-2 grid grid-cols-3 gap-4 px-4 text-sm">
          <div className="col-span-1">
            <span className="text-gray-500">文件类型：</span>
            <span className="text-gray-900 dark:text-gray-100">
              {documentData.document_info.file_type}
            </span>
          </div>
          <div>
            <span className="text-gray-500">文件大小：</span>
            <span className="text-gray-900 dark:text-gray-100">
              {(documentData.document_info.file_size / 1024).toFixed(2)} KB
            </span>
          </div>
          <div>
            <span className="text-gray-500">解析时间：</span>
            <span className="text-gray-900 dark:text-gray-100">
              {new Date(documentData.document_info.parsed_at).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="prose prose-sm overflow-y-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <Markdown className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {documentData.document_content}
          </Markdown>
        </div>
      </div>
    </div>
  );
}
// 数据库查询工具结果视图
function DatabaseQueryToolCallView({
  search,
  content,
}: {
  search: string;
  content: string;
}) {
  const { isTable, tableData } = parseTableText(content);
  const data = isTable ? convertToMarkdownTable(tableData ?? []) : content;
  return (
    <div className="w-full overflow-x-auto">
      <Markdown className="text-sm text-gray-500">{search}</Markdown>
      <div className="max-w-[1000px] overflow-x-auto">
        <Markdown>{data}</Markdown>
      </div>
    </div>
  );
}

export const TaskToolResultView = function TaskToolResultView({
  task,
}: {
  task: ToolCallTask;
}) {
  if (task.type === "thinking") {
    // 加载中
    if (task.state === "pending" && task.payload?.text?.length === 0) {
      return (
        <div className="flex h-full items-center justify-center text-sm font-bold text-[#858481]">
          <LoaderCircle size={20} className="animate-spin" />
        </div>
      );
    }
    if (task.agentName === "planner") {
      return <PlanTaskView task={task} />;
    } else if (task.agentName === "chart_generator") {
      return <GenerateEchartsChartView task={task} />;
    } else if (task.agentName === "reporter") {
      return <ReportTaskView tasks={[task]} />;
    } else {
      return <Markdown>{task.payload.text ?? ""}</Markdown>;
    }
  } else if (task.type === "tool_call") {
    switch (task.payload.toolName) {
      case "tavily_search":
        return (
          <TravilySearchToolCallView
            task={task as ToolCallTask<{ query: string }>}
          />
        );
      case "crawl_tool":
        return (
          <CrawlToolCallView task={task as ToolCallTask<{ url: string }>} />
        );
      case "browser":
        return (
          <BrowserToolCallView
            task={task as ToolCallTask<{ instruction: string }>}
          />
        );
      case "python_repl_tool":
        return (
          <PythonReplToolCallView
            task={task as ToolCallTask<{ code: string }>}
          />
        );
      case "bash_tool":
        return (
          <BashToolCallView task={task as ToolCallTask<{ cmd: string }>} />
        );
      case "generate_echarts_chart":
        return <GenerateEchartsChartView task={task} />;
      case "analyze_document_content":
        return <AnalyzeDocumentContentToolCallView task={task} />;
      default: {
        if (
          task.payload.toolName === "execute_oracle_query" ||
          task.payload.toolName === "get_table_info" ||
          task.payload.toolName === "get_table_relationships"
        ) {
          const search =
            task.payload.toolName === "execute_oracle_query"
              ? "**执行的sql语句：**\n```sql\n" +
                (task.payload.input as any).sql +
                "\n```\n **查询结果：**\n"
              : ("**查询的表名：**\n" +
                  (task.payload.input as any).table_name ?? "") +
                "\n\n **查询结果：**\n";
          const content = task.payload.output ?? "";

          return (
            <DatabaseQueryToolCallView search={search} content={content} />
          );
        }
        return <div>{task.payload.toolName}</div>;
      }
    }
  }
};
