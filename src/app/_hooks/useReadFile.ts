import { useEffect, useState } from "react";

export function useReadFile(file: File) {
  const [content, setContent] = useState("");
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setContent(e.target?.result as string);
    };
    reader.readAsText(file);
  }, [file]);
  return content;
}
