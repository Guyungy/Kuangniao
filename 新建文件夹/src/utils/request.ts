import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import qs from "qs";
import { ElMessage, ElNotification } from "element-plus";
import { useUserStoreHook } from "@/store/modules/user-store";
import { ResultEnum } from "@/enums/api/result.enum";
import { AuthStorage } from "@/utils/auth";
import router from "@/router";

/**
 * 创建 HTTP 请求实例
 */
const httpRequest = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params),
});

/**
 * 请求拦截器 - 添加 Authorization 头
 */
httpRequest.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = AuthStorage.getAccessToken();

    // 如果 Authorization 设置为 no-auth，则不携带 Token
    if (config.headers.Authorization !== "no-auth" && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }

    // 添加调试日志
    console.log('=== 请求拦截器调试 ===');
    console.log('请求URL:', config.url);
    console.log('请求方法:', config.method);
    console.log('Authorization头:', config.headers.Authorization);
    console.log('AccessToken:', accessToken);
    
    if (config.method === 'post' || config.method === 'put') {
      console.log('请求头:', config.headers);
      console.log('请求数据:', config.data);
      console.log('请求数据类型:', typeof config.data);
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器 - 统一处理响应和错误
 */
httpRequest.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>): any => {
    // 如果响应是二进制流，则直接返回（用于文件下载、Excel 导出等）
    if (response.config.responseType === "blob") {
      return response;
    }

    const { code, data, msg } = response.data;

    // 请求成功 - 支持字符串和数字格式的响应码
    if (code === ResultEnum.SUCCESS || code === 200 || code === "00000") {
      return data; // 返回实际数据，而不是整个响应对象
    }

    // 业务错误
    const errorMessage = msg || "系统出错";
    
    // 根据错误信息提供更友好的提示
    let friendlyMessage = errorMessage;
    
    if (errorMessage.includes('数据库') || errorMessage.includes('Database') || errorMessage.includes('Connection')) {
      friendlyMessage = "数据库连接异常，请稍后重试";
    } else if (errorMessage.includes('参数') || errorMessage.includes('Parameter') || errorMessage.includes('validation')) {
      friendlyMessage = "请求参数错误，请检查输入";
    } else if (errorMessage.includes('权限') || errorMessage.includes('Permission') || errorMessage.includes('unauthorized')) {
      friendlyMessage = "权限不足，请联系管理员";
    } else if (errorMessage.includes('Token') || errorMessage.includes('token') || errorMessage.includes('登录')) {
      friendlyMessage = "登录已过期，请重新登录";
    } else if (errorMessage.includes('用户名') || errorMessage.includes('密码')) {
      friendlyMessage = "用户名或密码错误";
    } else if (errorMessage.includes('不存在') || errorMessage.includes('not found')) {
      friendlyMessage = "请求的资源不存在";
    }
    
    ElMessage.error(friendlyMessage);
    return Promise.reject(new Error(friendlyMessage));
  },
  async (error) => {
    console.error("Response interceptor error:", error);

    const { config, response } = error;

    // 网络错误或服务器无响应
    if (!response) {
      let errorMessage = "网络连接失败，请检查网络设置";
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = "请求超时，请稍后重试";
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = "网络连接失败，请检查网络设置";
      } else if (error.message) {
        if (error.message.includes('Network Error')) {
          errorMessage = "网络连接失败，请检查网络设置";
        } else if (error.message.includes('timeout')) {
          errorMessage = "请求超时，请稍后重试";
        } else {
          errorMessage = error.message;
        }
      }
      
      ElMessage.error(errorMessage);
      return Promise.reject(error);
    }

    // 检查响应数据是否为标准API格式
    const responseData = response.data;
    if (!responseData || typeof responseData !== 'object') {
      // 非标准响应格式，直接显示HTTP状态错误
      const statusText = response.statusText || '请求失败';
      let errorMessage = `${response.status}: ${statusText}`;
      
      // 根据状态码提供更友好的错误信息
      switch (response.status) {
        case 500:
          errorMessage = "服务器内部错误，请稍后重试";
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = "服务器暂时不可用，请稍后重试";
          break;
        case 404:
          errorMessage = "请求的资源不存在";
          break;
        case 403:
          errorMessage = "没有权限访问此资源";
          break;
        case 401:
          errorMessage = "请先登录";
          break;
      }
      
      ElMessage.error(errorMessage);
      return Promise.reject(new Error(errorMessage));
    }

    const { code, msg } = responseData as ApiResponse;
    const errorMessage = msg || "请求失败";

    switch (code) {
      case ResultEnum.ACCESS_TOKEN_INVALID:
      case 401:
        // Access Token 过期，尝试刷新
        return refreshTokenAndRetry(config);

      case ResultEnum.REFRESH_TOKEN_INVALID:
      case 403:
        // Refresh Token 过期，跳转登录页
        await redirectToLogin("登录已过期，请重新登录");
        return Promise.reject(new Error(errorMessage));

      default:
        // 根据错误码提供更具体的错误信息
        let specificMessage = errorMessage;
        
        if (errorMessage.includes('数据库') || errorMessage.includes('Database')) {
          specificMessage = "数据库连接异常，请稍后重试";
        } else if (errorMessage.includes('参数') || errorMessage.includes('Parameter')) {
          specificMessage = "请求参数错误，请检查输入";
        } else if (errorMessage.includes('权限') || errorMessage.includes('Permission')) {
          specificMessage = "权限不足，请联系管理员";
        } else if (errorMessage.includes('Token') || errorMessage.includes('token')) {
          specificMessage = "登录已过期，请重新登录";
        }
        
        ElMessage.error(specificMessage);
        return Promise.reject(new Error(specificMessage));
    }
  }
);

/**
 * 重试请求的回调函数类型
 */
type RetryCallback = () => void;

// Token 刷新相关状态
let isRefreshingToken = false;
const pendingRequests: RetryCallback[] = [];

/**
 * 刷新 Token 并重试请求
 */
async function refreshTokenAndRetry(config: InternalAxiosRequestConfig): Promise<any> {
  return new Promise((resolve, reject) => {
    // 封装需要重试的请求
    const retryRequest = () => {
      const newToken = AuthStorage.getAccessToken();
      if (newToken && config.headers) {
        config.headers.Authorization = `Bearer ${newToken}`;
      }
      httpRequest(config).then(resolve).catch(reject);
    };

    // 将请求加入等待队列
    pendingRequests.push(retryRequest);

    // 如果没有正在刷新，则开始刷新流程
    if (!isRefreshingToken) {
      isRefreshingToken = true;

      useUserStoreHook()
        .refreshToken()
        .then(() => {
          // 刷新成功，重试所有等待的请求
          pendingRequests.forEach((callback) => {
            try {
              callback();
            } catch (error) {
              console.error("Retry request error:", error);
            }
          });
          // 清空队列
          pendingRequests.length = 0;
        })
        .catch(async (error) => {
          console.error("Token refresh failed:", error);
          // 刷新失败，清空队列并跳转登录页
          pendingRequests.length = 0;
          await redirectToLogin("登录状态已失效，请重新登录");
          // 拒绝所有等待的请求
          pendingRequests.forEach(() => {
            reject(new Error("Token refresh failed"));
          });
        })
        .finally(() => {
          isRefreshingToken = false;
        });
    }
  });
}

/**
 * 重定向到登录页面
 */
async function redirectToLogin(message: string = "请重新登录"): Promise<void> {
  try {
    ElNotification({
      title: "提示",
      message,
      type: "warning",
      duration: 3000,
    });

    await useUserStoreHook().resetAllState();

    // 跳转到登录页，保留当前路由用于登录后跳转
    const currentPath = router.currentRoute.value.fullPath;
    await router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  } catch (error) {
    console.error("Redirect to login error:", error);
  }
}

export default httpRequest;
