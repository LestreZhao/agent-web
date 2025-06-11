import { GlobalOutlined, PythonOutlined } from "@ant-design/icons";
import * as echarts from "echarts";
import { LRUCache } from "lru-cache";
import { Loader2 } from "lucide-react";
import { memo, useEffect, useMemo, useRef } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

import { Markdown } from "~/components/comon/Markdown";
import { type ToolCallTask } from "~/core/workflow";
// 执行浏览器
const BrowserToolCallView = memo(function BrowserToolCallView({
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
});
// 执行计划
const PlanTaskView = memo(function PlanTaskView({ task }: { task: any }) {
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
});
// 爬取网页
const pageCache = new LRUCache<string, string>({ max: 100 });
const CrawlToolCallView = memo(function CrawlToolCallView({
  task,
}: {
  task: ToolCallTask<{ url: string }>;
}) {
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
});
// const CrawlToolCallView = memo(function CrawlToolCallView({
//   task,
// }: {
//   task: ToolCallTask<{ url: string }>;
// }) {
//   const title = useMemo(() => {
//     return pageCache.get(task.payload.input.url);
//   }, [task.payload.input.url]);

//   // 检测文件类型
//   const fileType = useMemo(() => {
//     const url = task.payload.input.url.toLowerCase();
//     if (url.includes(".pdf")) return "pdf";
//     if (url.includes(".md") || url.includes(".markdown")) return "markdown";
//     if (url.includes(".txt")) return "text";
//     if (url.includes(".doc") || url.includes(".docx")) return "document";
//     if (url.includes(".xls") || url.includes(".xlsx")) return "spreadsheet";
//     if (url.includes(".ppt") || url.includes(".pptx")) return "presentation";
//     if (
//       url.includes(".jpg") ||
//       url.includes(".jpeg") ||
//       url.includes(".png") ||
//       url.includes(".gif") ||
//       url.includes(".webp")
//     )
//       return "image";
//     if (
//       url.includes(".mp4") ||
//       url.includes(".avi") ||
//       url.includes(".mov") ||
//       url.includes(".webm")
//     )
//       return "video";
//     return "webpage";
//   }, [task.payload.input.url]);

//   return (
//     <div>
//       {task.payload.output && task.state === "success" && (
//         <div className="space-y-4">
//           {/* 网页预览 */}
//           <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
//             <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 dark:border-gray-600 dark:from-gray-800 dark:to-gray-700">
//               <div className="flex items-center gap-2">
//                 <div className="flex gap-1">
//                   <div className="h-3 w-3 rounded-full bg-red-500"></div>
//                   <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
//                   <div className="h-3 w-3 rounded-full bg-green-500"></div>
//                 </div>
//                 <div className="flex flex-1 items-center justify-center gap-2">
//                   {fileType === "pdf" && (
//                     <span className="text-red-500">📄</span>
//                   )}
//                   {fileType === "markdown" && (
//                     <span className="text-blue-600">📝</span>
//                   )}
//                   {fileType === "text" && (
//                     <span className="text-gray-600">📄</span>
//                   )}
//                   {fileType === "image" && (
//                     <span className="text-green-500">🖼️</span>
//                   )}
//                   {fileType === "video" && (
//                     <span className="text-purple-500">🎥</span>
//                   )}
//                   {fileType === "document" && (
//                     <span className="text-blue-500">📄</span>
//                   )}
//                   {fileType === "spreadsheet" && (
//                     <span className="text-green-600">📊</span>
//                   )}
//                   {fileType === "presentation" && (
//                     <span className="text-orange-500">📋</span>
//                   )}
//                   {fileType === "webpage" && (
//                     <GlobalOutlined className="h-4 w-4 text-gray-500" />
//                   )}
//                   <span className="truncate font-mono text-sm text-gray-600 dark:text-gray-300">
//                     {task.payload.input.url}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* 内容显示区域 */}
//             <div className="w-full">
//               {fileType === "pdf" && (
//                 <iframe
//                   src={task.payload.input.url}
//                   className="h-[600px] w-full border-0"
//                   title="PDF预览"
//                 />
//               )}

//               {(fileType === "markdown" || fileType === "text") && (
//                 <iframe
//                   src={task.payload.input.url}
//                   className="h-[80vh] max-h-[800px] min-h-[400px] w-full border-0 bg-white"
//                   title={fileType === "markdown" ? "Markdown预览" : "文本预览"}
//                 />
//               )}

//               {fileType === "image" && (
//                 <div className="flex justify-center p-4">
//                   <img
//                     src={task.payload.input.url}
//                     alt="图片预览"
//                     className="max-h-[600px] max-w-full rounded-lg object-contain shadow-sm"
//                   />
//                 </div>
//               )}

//               {fileType === "video" && (
//                 <video
//                   src={task.payload.input.url}
//                   className="h-[600px] w-full object-contain"
//                   controls
//                   preload="metadata"
//                 >
//                   您的浏览器不支持视频播放
//                 </video>
//               )}

//               {(fileType === "document" ||
//                 fileType === "spreadsheet" ||
//                 fileType === "presentation") && (
//                 <div className="flex h-[600px] flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
//                   <div className="p-8 text-center">
//                     <div className="mb-4 text-6xl">
//                       {fileType === "document" && "📄"}
//                       {fileType === "spreadsheet" && "📊"}
//                       {fileType === "presentation" && "📋"}
//                     </div>
//                     <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
//                       {fileType === "document" && "Word文档"}
//                       {fileType === "spreadsheet" && "Excel表格"}
//                       {fileType === "presentation" && "PowerPoint演示文稿"}
//                     </h3>
//                     <p className="mb-4 text-gray-600 dark:text-gray-400">
//                       浏览器无法直接预览此文件类型
//                     </p>
//                     <a
//                       href={task.payload.input.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
//                     >
//                       下载文件
//                     </a>
//                   </div>
//                 </div>
//               )}

//               {fileType === "webpage" && (
//                 <iframe
//                   src={task.payload.input.url}
//                   className="h-[80vh] max-h-[800px] min-h-[400px] w-full border-0"
//                   title="网页预览"
//                   sandbox="allow-scripts allow-same-origin allow-popups"
//                 />
//               )}
//             </div>

//             {/* 底部操作栏 */}
//             <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-800">
//               <div className="flex items-center justify-between text-sm">
//                 <div className="text-gray-600 dark:text-gray-400">
//                   {fileType === "pdf" && "PDF文档"}
//                   {fileType === "markdown" && "Markdown文档"}
//                   {fileType === "text" && "文本文件"}
//                   {fileType === "image" && "图片文件"}
//                   {fileType === "video" && "视频文件"}
//                   {fileType === "document" && "Word文档"}
//                   {fileType === "spreadsheet" && "Excel表格"}
//                   {fileType === "presentation" && "PowerPoint演示文稿"}
//                   {fileType === "webpage" && "网页"}
//                 </div>
//                 <a
//                   href={task.payload.input.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="font-medium text-blue-600 hover:underline dark:text-blue-400"
//                 >
//                   {fileType === "webpage"
//                     ? "在新窗口打开"
//                     : fileType === "image" ||
//                         fileType === "video" ||
//                         fileType === "pdf"
//                       ? "在新窗口查看"
//                       : "下载文件"}{" "}
//                   →
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// });
// 执行搜索
const TravilySearchToolCallView = memo(function TravilySearchToolCallView({
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
});
// 执行python代码
const PythonReplToolCallView = memo(function PythonReplToolCallView({
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
});
// 执行bash命令
const BashToolCallView = memo(function BashToolCallView({
  task,
}: {
  task: ToolCallTask<{ cmd: string }>;
}) {
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
});
// ECharts图表生成工具视图
const GenerateEchartsChartView = memo(function GenerateEchartsChartView({
  task,
}: {
  task: ToolCallTask<any>;
}) {
  console.log("Task Payload:", task);
  const chartsData = useMemo(() => {
    try {
      let jsonData;
      if (task.payload.text && task.state === "success") {
        jsonData = JSON.parse(
          task.payload.text.replace(/```json/g, "").replace(/```/g, ""),
        );
      } else {
        return null;
      }
      console.log("Parsed JSON:", jsonData);
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
    } catch (error) {
      console.error("解析图表数据失败:", error);
      return [];
    }
  }, [task.payload]);

  console.log("Final Charts Data:", chartsData);

  if (!chartsData || chartsData.length === 0) {
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
  return (
    <div className="w-full space-y-4">
      {chartsData.map((chart: any, index: number) => (
        <ChartCard key={index} chart={chart} />
      ))}
    </div>
  );
});
// 单个图表卡片组件
const ChartCard = memo(function ChartCard({ chart }: { chart: any }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  const chartOption = useMemo(() => {
    const chartData = chart.chart_data;
    if ("grid" in chartData) {
      delete chartData.grid;
    }
    return {
      ...chart.chart_data,
      legend: {
        ...chart.chart_data?.legend,
        top: "95%",
      },
      grid: {
        bottom: "5%",
        containLabel: true,
      },
    };
  }, [chart]);

  const description = useMemo(() => {
    return chart.description ?? "";
  }, [chart]);

  // 转换数据为 ECharts 配置
  // const chartOption = useMemo(() => {
  //   if (chart.chart_type === "bar") {
  //     return {
  //       title: {
  //         text: chart.chart_data.title,
  //         left: "center",
  //       },
  //       tooltip: {
  //         trigger: "axis",
  //         axisPointer: {
  //           type: "shadow",
  //         },
  //       },
  //       grid: {
  //         left: "3%",
  //         right: "4%",
  //         bottom: "3%",
  //         containLabel: true,
  //       },
  //       xAxis: {
  //         type: "category",
  //         name: chart.chart_data.x_axis?.name,
  //         data: chart.chart_data.x_axis?.data ?? [],
  //         axisLabel: {
  //           interval: 0,
  //           rotate: 45,
  //         },
  //       },
  //       yAxis: {
  //         type: "value",
  //         name: chart.chart_data.y_axis?.name,
  //       },
  //       series: chart.chart_data.series.map((series: any) => ({
  //         name: series.name,
  //         type: "bar",
  //         data: series.data,
  //         label: {
  //           show: true,
  //           position: "top",
  //         },
  //       })),
  //     };
  //   } else if (chart.chart_type === "pie") {
  //     return {
  //       title: {
  //         text: chart.chart_data.title,
  //         left: "center",
  //       },
  //       tooltip: {
  //         trigger: "item",
  //         formatter: "{a} <br/>{b}: {c} ({d}%)",
  //       },
  //       legend: {
  //         orient: "vertical",
  //         left: "left",
  //         top: "middle",
  //       },
  //       series: chart.chart_data.series.map((series: any) => ({
  //         name: series.name,
  //         type: "pie",
  //         radius: ["40%", "70%"],
  //         avoidLabelOverlap: true,
  //         itemStyle: {
  //           borderRadius: 10,
  //           borderColor: "#fff",
  //           borderWidth: 2,
  //         },
  //         emphasis: {
  //           label: {
  //             show: true,
  //             fontSize: 14,
  //             fontWeight: "bold",
  //           },
  //         },
  //         data: series.data,
  //       })),
  //     };
  //   } else if (chart.chart_type === "combo") {
  //     // 处理组合图表
  //     return {
  //       title: {
  //         text: chart.options.plugins.title.text,
  //         left: "center",
  //         top: 0,
  //       },
  //       tooltip: {
  //         trigger: "axis",
  //         axisPointer: {
  //           type: "cross",
  //         },
  //       },
  //       legend: {
  //         data: chart.chart_data.datasets.map((dataset: any) => dataset.label),
  //         top: 30,
  //         left: "center",
  //       },
  //       grid: {
  //         containLabel: true,
  //       },
  //       xAxis: {
  //         type: "category",
  //         data: chart.chart_data.labels,
  //         name: chart.options.scales.x.title.text,
  //         axisLabel: {
  //           interval: 0,
  //           rotate: 45,
  //         },
  //       },
  //       yAxis: [
  //         {
  //           type: "value",
  //           name: chart.options.scales.y_revenue.title.text,
  //           position: "left",
  //         },
  //         {
  //           type: "value",
  //           name: chart.options.scales.y_patients.title.text,
  //           position: "right",
  //         },
  //       ],
  //       series: chart.chart_data.datasets.map(
  //         (dataset: any, index: number) => ({
  //           name: dataset.label,
  //           type: dataset.type === "bar" ? "bar" : "line",
  //           yAxisIndex: index,
  //           data: dataset.data,
  //           label: {
  //             show: true,
  //             position: "top",
  //           },
  //         }),
  //       ),
  //     };
  //   } else if (chart.chart_type === "horizontalBar") {
  //     // 处理横向柱状图
  //     return {
  //       title: {
  //         text: chart.options.plugins.title.text,
  //         left: "center",
  //       },
  //       tooltip: {
  //         trigger: "axis",
  //         axisPointer: {
  //           type: "shadow",
  //         },
  //       },
  //       legend: {
  //         top: 30,
  //         data: chart.chart_data.datasets.map((dataset: any) => dataset.label),
  //       },
  //       grid: {
  //         left: "3%",
  //         right: "4%",
  //         bottom: "3%",
  //         containLabel: true,
  //       },
  //       xAxis: {
  //         type: "value",
  //         name: chart.options.scales.x.title.text,
  //       },
  //       yAxis: {
  //         type: "category",
  //         data: chart.chart_data.labels,
  //         axisLabel: {
  //           interval: 0,
  //         },
  //       },
  //       series: chart.chart_data.datasets.map((dataset: any) => ({
  //         name: dataset.label,
  //         type: "bar",
  //         data: dataset.data,
  //         label: {
  //           show: true,
  //           position: "right",
  //         },
  //       })),
  //     };
  //   }
  //   return null;
  // }, [chart]);

  // 初始化和更新图表
  useEffect(() => {
    if (!chartRef.current || !chartOption) return;

    const initChart = () => {
      if (!chartRef.current) return;

      // 检查容器是否有实际尺寸
      const { clientWidth, clientHeight } = chartRef.current;
      if (clientWidth === 0 || clientHeight === 0) return;

      // 销毁现有实例
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      // 初始化新实例
      chartInstance.current = echarts.init(chartRef.current);
      chartInstance.current.setOption(chartOption);
    };

    // 使用 ResizeObserver 监听容器大小变化
    const resizeObserver = new ResizeObserver((entries) => {
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

    resizeObserver.observe(chartRef.current);

    // 清理函数
    return () => {
      resizeObserver.disconnect();
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, [chartOption]);

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="p-4">
        {/* 图表容器 */}
        <div
          ref={chartRef}
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
// 分析文档内容
const AnalyzeDocumentContentToolCallView = memo(
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
                {new Date(
                  documentData.document_info.parsed_at,
                ).toLocaleString()}
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
  },
);

export function TaskToolResultView({ task }: { task: ToolCallTask }) {
  if (task.type === "thinking") {
    if (task.agentName === "planner") {
      return <PlanTaskView task={task} />;
    } else if (task.agentName === "chart_generator") {
      return <GenerateEchartsChartView task={task} />;
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
              ? (task.payload.input as any).sql
              : "查询的表名：\n" + (task.payload.input as any).table_name;
          const content =
            "执行的sql语句：\n```sql\n" +
            search +
            "\n```\n" +
            `执行结果：\n \`\`\`json\n${task.payload.output ?? ""}\n\`\`\``;
          return <Markdown>{content}</Markdown>;
        }
        return <div>{task.payload.toolName}</div>;
      }
    }
  }
}
