import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { toast } from "sonner";

// 响应数据接口
interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 自定义配置接口
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean;
  showErrorMessage?: boolean;
}

const whiteList = ["/auth/login", "/auth/register"];
class ServiceClient {
  private instance: AxiosInstance;
  private baseConfig: CustomAxiosRequestConfig = {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
    showErrorMessage: true,
  };

  constructor() {
    this.instance = axios.create(this.baseConfig);
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        // 检查是否在白名单中
        const isWhiteList = whiteList.some((path) =>
          config.url?.includes(path),
        );
        // 非白名单路径才添加 token
        if (!isWhiteList) {
          const token = localStorage.getItem("token");
          if (token) {
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${token}`,
            };
          }
        }
        return config;
      },
      (error: Error) => {
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data: resData } = response;

        // 处理业务错误
        if (resData.code !== 200) {
          const error = new Error(resData.message ?? "请求失败") as Error & {
            code?: number;
            config?: CustomAxiosRequestConfig;
          };
          error.code = resData.code;
          error.config = response.config as CustomAxiosRequestConfig;
          return Promise.reject(error);
        }

        return resData.data;
      },
      (error) => {
        this.handleError(error);
        return Promise.reject(error);
      },
    );
  }

  private handleError(error: any): void {
    const config = error.config as CustomAxiosRequestConfig;

    // 如果配置了跳过错误处理，直接返回
    if (config?.skipErrorHandler) {
      return;
    }

    let message = "请求失败";

    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          message = "请求参数错误";
          break;
        case 401:
          message = "未授权，请重新登录";
          // 可以在这里处理登出逻辑
          this.handleUnauthorized();
          break;
        case 403:
          message = "拒绝访问";
          break;
        case 404:
          message = "请求地址不存在";
          break;
        case 500:
          message = "服务器错误";
          break;
        default:
          message = `请求失败(${status})`;
      }
    } else if (error.request) {
      message = "网络错误，请检查网络连接";
    } else {
      message = error.message;
    }

    if (config?.showErrorMessage !== false) {
      toast.error(message);
    }
  }

  private handleUnauthorized(): void {
    localStorage.removeItem("token");
    // 可以触发登出事件或重定向到登录页
    window.location.href = "/auth/login";
  }

  // 通用请求方法
  public async request<T = any>(config: CustomAxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.request<any, T>(config);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // GET 请求
  public async get<T = any>(
    url: string,
    params?: any,
    config?: CustomAxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>({
      method: "GET",
      url,
      params,
      ...config,
    });
  }

  // POST 请求
  public async post<T = any>(
    url: string,
    data?: any,
    config?: CustomAxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>({
      method: "POST",
      url,
      data,
      ...config,
    });
  }

  // PUT 请求
  public async put<T = any>(
    url: string,
    data?: any,
    config?: CustomAxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>({
      method: "PUT",
      url,
      data,
      ...config,
    });
  }

  // DELETE 请求
  public async delete<T = any>(
    url: string,
    params?: any,
    config?: CustomAxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>({
      method: "DELETE",
      url,
      params,
      ...config,
    });
  }

  // 上传文件
  public async upload<T = any>(
    url: string,
    file: File | FormData,
    config?: CustomAxiosRequestConfig,
  ): Promise<T> {
    const formData = file instanceof FormData ? file : new FormData();
    if (file instanceof File) {
      formData.append("file", file);
    }

    return this.request<T>({
      method: "POST",
      url,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...config,
    });
  }

  // 下载文件
  public async download(
    url: string,
    filename?: string,
    config?: CustomAxiosRequestConfig,
  ): Promise<void> {
    const response = await this.request<Blob>({
      method: "GET",
      url,
      responseType: "blob",
      ...config,
    });

    const blob = new Blob([response]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename ?? "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// 创建实例
export const service = new ServiceClient();

// 导出类型
export type { CustomAxiosRequestConfig, ApiResponse };
