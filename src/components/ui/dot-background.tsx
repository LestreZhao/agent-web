// src/components/ui/dot-background.tsx
"use client";

import { useEffect, useRef } from "react";

export function DotBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置canvas尺寸为窗口大小
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr); // 缩放以适应设备像素比
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 定义点的属性
    const dots: {
      x: number;
      y: number;
      alpha: number;
      targetAlpha: number;
    }[] = [];

    // 创建规整的网格点阵
    const createDots = () => {
      const spacing = 20; // 点之间的间距
      const margin = spacing / 2; // 边距
      const rows = Math.floor((canvas.height - margin * 2) / spacing);
      const cols = Math.floor((canvas.width - margin * 2) / spacing);

      // 清空现有的点
      dots.length = 0;

      // 计算起始位置，使网格居中
      const startX = (canvas.width - (cols - 1) * spacing) / 2;
      const startY = (canvas.height - (rows - 1) * spacing) / 2;

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          dots.push({
            x: startX + j * spacing,
            y: startY + i * spacing,
            alpha: 0.3 + Math.random() * 0.2, // 初始透明度在 0.3-0.5 之间
            targetAlpha: 0.3 + Math.random() * 0.2,
          });
        }
      }
    };

    createDots();

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 更新和绘制每个点
      dots.forEach((dot) => {
        // 缓慢更新透明度目标值
        if (Math.random() < 0.002) {
          // 降低更新频率
          dot.targetAlpha = 0.3 + Math.random() * 0.2;
        }

        // 平滑过渡到目标透明度
        dot.alpha += (dot.targetAlpha - dot.alpha) * 0.1;

        // 绘制点
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1, 0, Math.PI * 2); // 固定大小的点
        ctx.fillStyle = `rgba(158, 158, 158, ${dot.alpha})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    // 窗口大小改变时重新创建网格
    window.addEventListener("resize", createDots);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("resize", createDots);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 bg-[#FAFAFA]"
      style={{ touchAction: "none" }}
    />
  );
}
