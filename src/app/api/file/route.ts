import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filePath = searchParams.get('path');
  
  if (!filePath) {
    return NextResponse.json({ error: '缺少文件路径参数' }, { status: 400 });
  }
  
  try {
    // 检查路径是否是Mac本地路径
    if (!filePath.startsWith('/Users/')) {
      return NextResponse.json({ error: '无效的文件路径' }, { status: 400 });
    }
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }
    
    // 读取文件内容
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // 根据文件扩展名设置正确的内容类型
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'text/plain';
    
    if (ext === '.md' || ext === '.markdown') {
      contentType = 'text/markdown';
      
      // 对Markdown文件进行额外处理，确保格式正确
      // 例如：确保代码块有正确的换行格式
      const processedContent = fileContent
        // 确保代码块格式正确
        .replace(/```(\w+)\s+([^`]+)```/g, (match, lang, content) => {
          return `\`\`\`${lang}\n${content.trim()}\n\`\`\``;
        });
      
      return new NextResponse(processedContent, {
        headers: {
          'Content-Type': contentType,
        },
      });
    } else if (ext === '.json') {
      contentType = 'application/json';
    } else if (ext === '.html') {
      contentType = 'text/html';
    } else if (ext === '.pdf') {
      contentType = 'application/pdf';
    }
    
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('读取文件出错:', error);
    return NextResponse.json(
      { error: '读取文件失败', details: (error as Error).message },
      { status: 500 }
    );
  }
} 