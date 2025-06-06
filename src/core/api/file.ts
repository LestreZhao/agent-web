import { env } from "~/env";

/**
 * 上传文件到服务器
 * @param file 要上传的文件
 * @returns 上传成功后的响应数据
 */
export async function uploadFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await fetch(
      env.NEXT_PUBLIC_API_URL + "/documents/upload",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`上传失败: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("文件上传出错:", error);
    throw error;
  }
}
