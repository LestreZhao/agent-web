import { useEffect, useState } from "react";

export function useIframeCheck(url: string) {
  const [canEmbed, setCanEmbed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    setLoading(true);
    setCanEmbed(null);
    setError(null);

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.sandbox = "allow-scripts allow-same-origin allow-popups";
    iframe.src = url;

    let settled = false;

    const cleanUp = () => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    const handleResult = (result: boolean, err?: string) => {
      if (!settled) {
        settled = true;
        setCanEmbed(result);
        setError(err || null);
        setLoading(false);
        cleanUp();
      }
    };

    iframe.onload = () => {
      try {
        console.log("iframe", iframe);
        const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
        console.log("doc", doc);
        if (!doc?.body || doc.body.innerHTML.trim() === "") {
          handleResult(false, "iframe 加载完成但内容为空，疑似被拒绝嵌入");
        } else {
          handleResult(true);
        }
      } catch (e) {
        console.log("e", e);
        // 跨域访问不到内容，但说明可能加载成功
        handleResult(true);
      }
    };

    iframe.onerror = () => {
      handleResult(false, "iframe 加载失败");
    };
    // 超时处理（3 秒内没响应）
    const timeout = setTimeout(() => {
      handleResult(false, "iframe 加载超时");
    }, 3000);

    document.body.appendChild(iframe);

    return () => {
      clearTimeout(timeout);
      cleanUp();
    };
  }, [url]);

  return { canEmbed, loading, error };
}
