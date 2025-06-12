"use client";

import { animate, stagger } from "framer-motion";
import { useEffect, useRef } from "react";

export default function WavyText({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void document.fonts.ready.then(() => {
      if (!containerRef.current) return;

      // 清除之前的内容
      const wavyElement = containerRef.current.querySelector(".wavy");
      if (!wavyElement) return;

      // 将文本分割成单个字符并包装在 span 中
      const chars = text
        .split("")
        .map((char) => `<span class="split-char">${char}</span>`)
        .join("");
      wavyElement.innerHTML = chars;

      // 获取所有字符元素
      const charElements = containerRef.current.querySelectorAll(".split-char");
      if (charElements.length === 0) return;

      containerRef.current.style.visibility = "visible";
      const staggerDelay = 0.15;

      animate(
        charElements,
        { y: [-2, 2] },
        {
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
          duration: 1.5,
          delay: stagger(staggerDelay, {
            startDelay: -staggerDelay * charElements.length,
          }),
        },
      );
    });
  }, [containerRef, text]);

  return (
    <div className="container" ref={containerRef}>
      <h1 className="h1">
        <span className="wavy">{text}</span>
      </h1>
      <Stylesheet />
    </div>
  );
}

function Stylesheet() {
  return (
    <style>{`
      .container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        visibility: hidden;
      }

      .split-char {
        display: inline-block;
        will-change: transform;
      }

      .wavy {
        display: inline-block;
        white-space: pre;
      }
    `}</style>
  );
}
