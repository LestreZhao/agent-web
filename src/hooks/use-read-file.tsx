
import * as mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import { useCallback, useState } from "react";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type ResultType = "html" | "pdf";

export function useDocumentReader() {
  const [type, setType] = useState<ResultType | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [pdfBuffer, setPdfBuffer] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readDocument = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setHtml(null);
    setPdfBuffer(null);

    const ext = file.name.split(".").pop()?.toLowerCase();
    try {
      if (ext === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setType("html");
        setHtml(result.value); // result.value 是 HTML 字符串
      } else if (ext === "pdf") {
        const buffer = new Uint8Array(await file.arrayBuffer());
        setType("pdf");
        setPdfBuffer(buffer);
      } else {
        setError("Unsupported file type");
      }
    } catch (e) {
      setError("Failed to read file");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    type,
    html,
    pdfBuffer,
    loading,
    error,
    readDocument,
  };
}
