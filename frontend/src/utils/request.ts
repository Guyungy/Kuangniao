import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosInstance } from "axios";
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
  baseURL: 'http://localhost:10000/api/v1', // 本地后端地址
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
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
    console.log('🚀 === 请求拦截器调试 ===');
    console.log('请求URL:', config.url);
    console.log('请求方法:', config.method?.toUpperCase());
    console.log('请求参数:', config.params);
    console.log('请求头:', config.headers);
    console.log('Authorization头:', config.headers.Authorization);
    console.log('AccessToken:', accessToken);
    
    if (config.method === 'post' || config.method === 'put') {
      console.log('请求数据:', config.data);
      console.log('请求数据类型:', typeof config.data);
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器 - 统一处理响应和错误
 */
httpRequest.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>): any => {
    console.log('📥 === 响应拦截器调试 ===');
    console.log('响应状态码:', response.status);
    console.log('响应状态文本:', response.statusText);
    console.log('响应头:', response.headers);
    console.log('响应配置:', response.config);
    console.log('完整响应对象:', response);
    console.log('响应数据:', response.data);
    console.log('响应数据类型:', typeof response.data);
    
    // 如果响应是二进制流，则直接返回（用于文件下载、Excel 导出等）
    if (response.config.responseType === "blob") {
      console.log('📁 二进制流响应，直接返回');
      return response;
    }

    // 处理304状态码 - 现在后端强制发送200，这里应该不会执行
    if (response.status === 304) {
      console.log('⚠️ 收到304响应，让axios正常处理响应');
      console.log('304响应详情:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });
      // 对于304响应，我们不应该返回空数组，而是让axios正常处理
      // 这样前端就能获取到缓存的数据
      const { code, data, msg, message } = response.data as any;
      
      if (code === ResultEnum.SUCCESS || code === 200 || code === "00000") {
        console.log('✅ 304响应中获取到缓存数据:', data);
        return data;
      }
      
      // 如果没有业务数据，返回空数组
      console.log('⚠️ 304响应中没有业务数据，返回空数组');
      return [];
    }

    const { code, data, msg, message } = response.data as any;

    // 请求成功 - 支持字符串和数字格式的响应码
    if (code === ResultEnum.SUCCESS || code === 200 || code === "00000") {
      console.log('✅ 请求成功，返回数据:', data);
      console.log('返回数据类型:', typeof data);
      console.log('是否为数组:', Array.isArray(data));
      if (Array.isArray(data)) {
        console.log('数组长度:', data.length);
        console.log('数组前3项:', data.slice(0, 3));
      }
      return data; // 返回实际数据，而不是整个响应对象
    }

    // 业务错误 - 直接显示后端返回的具体错误信息
    const errorMessage = msg || message || "系统出错";
    
    console.log('❌ 业务错误:', errorMessage);
    console.log('错误详情:', { code, msg, message, data });
    ElMessage.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
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

    const { code, msg, message } = responseData as any;
    // 优先使用 msg，如果没有则使用 message，最后使用默认值
    const errorMessage = msg || message || "请求失败";

    console.log('🔍 错误响应详情:', {
      status: response.status,
      code,
      msg,
      message,
      finalErrorMessage: errorMessage,
      responseData
    });

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
        // 直接显示后端返回的具体错误信息，不做额外处理
        console.log('❌ 显示具体错误信息:', errorMessage);
        ElMessage.error(errorMessage);
        return Promise.reject(new Error(errorMessage));
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
