// 解析表格格式文本的函数
export function parseTableText(text: string): {
  isTable: boolean;
  tableData?: string[][];
} {
  const lines = text.split("\n").filter((line) => line.trim());

  // 检查是否包含数据库字段表格标题行
  const hasFieldTableHeader = lines.some(
    (line) =>
      line.includes("字段名") &&
      line.includes("数据类型") &&
      line.includes("长度") &&
      line.includes("可空") &&
      line.includes("默认值"),
  );

  // 检查是否包含查询结果表格
  const hasQueryResultHeader = lines.some(
    (line) =>
      line.includes("查询结果:") ||
      (line.includes("|") && lines.some((l) => l.includes("---"))),
  );

  if (!hasFieldTableHeader && !hasQueryResultHeader) return { isTable: false };

  const tableData: string[][] = [];
  let foundHeader = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // 跳过分隔线
    if (
      trimmedLine.startsWith("---") ||
      trimmedLine.startsWith("===") ||
      trimmedLine.match(/^-+$/)
    ) {
      continue;
    }

    // 跳过查询结果标题行
    if (trimmedLine.includes("查询结果:")) {
      continue;
    }

    // 检查是否是数据库字段表头
    if (trimmedLine.includes("字段名") && trimmedLine.includes("数据类型")) {
      const headers = trimmedLine
        .split("|")
        .map((h) => h.trim())
        .filter((h) => h);
      tableData.push(headers);
      foundHeader = true;
      continue;
    }

    // 检查是否是查询结果表头（包含|分隔符的行）
    if (
      !foundHeader &&
      trimmedLine.includes("|") &&
      !trimmedLine.includes("字段名")
    ) {
      const headers = trimmedLine
        .split("|")
        .map((h) => h.trim())
        .filter((h) => h);
      if (headers.length >= 2) {
        // 至少要有2列
        tableData.push(headers);
        foundHeader = true;
        continue;
      }
    }

    // 如果找到表头后，解析数据行
    if (foundHeader && trimmedLine.includes("|")) {
      const cells = trimmedLine
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c);
      if (cells.length >= 2) {
        // 至少要有2列数据
        tableData.push(cells);
      }
    }
  }

  return { isTable: tableData.length > 1, tableData };
}

export function convertToMarkdownTable(data: string[][]): string {
  if (!data?.length) return "";

  const headers = data[0] ?? [];

  // 生成表头
  let markdown = "| " + headers.join(" | ") + " |\n";

  // 生成分隔行
  markdown += "| " + headers.map(() => "---").join(" | ") + " |\n";

  // 生成数据行
  for (let i = 1; i < data.length; i++) {
    const currentRow = [...(data[i] ?? [])];
    // 确保每行的列数与表头一致，如果缺少则补充空值
    while (currentRow.length < headers.length) {
      currentRow.push("");
    }
    markdown += "| " + currentRow.join(" | ") + " |\n";
  }

  return markdown;
}
