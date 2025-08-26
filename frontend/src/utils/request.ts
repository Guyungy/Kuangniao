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
  (error) => {
    console.error('❌ === 响应错误拦截器 ===');
    console.error('错误对象:', error);
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    console.error('错误状态码:', error.response?.status);
    console.error('错误状态文本:', error.response?.statusText);
    console.error('错误响应数据:', error.response?.data);
    console.error('错误请求配置:', error.config);
    console.error('错误请求URL:', error.config?.url);
    console.error('错误请求方法:', error.config?.method);
    console.error('错误请求头:', error.config?.headers);
    console.error('错误请求参数:', error.config?.params);
    console.error('错误请求数据:', error.config?.data);
    console.error('错误堆栈:', error.stack);
    
    // 网络错误
    if (error.code === 'ECONNABORTED') {
      console.error('🌐 请求超时');
      ElMessage.error('请求超时，请检查网络连接');
      return Promise.reject(error);
    }
    
    // 网络连接错误
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 网络连接错误');
      ElMessage.error('网络连接失败，请检查网络设置');
      return Promise.reject(error);
    }
    
    // HTTP状态码错误
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('❌ 400 - 请求参数错误');
          ElMessage.error(data?.message || '请求参数错误');
          break;
        case 401:
          console.error('❌ 401 - 未授权访问');
          ElMessage.error(data?.message || '请先登录');
          // 可以在这里处理登录跳转
          break;
        case 403:
          console.error('❌ 403 - 禁止访问');
          ElMessage.error(data?.message || '没有权限访问此资源');
          break;
        case 404:
          console.error('❌ 404 - 资源不存在');
          ElMessage.error(data?.message || '请求的资源不存在');
          break;
        case 500:
          console.error('❌ 500 - 服务器内部错误');
          ElMessage.error(data?.message || '服务器内部错误，请稍后重试');
          break;
        default:
          console.error(`❌ ${status} - 未知错误`);
          ElMessage.error(data?.message || `请求失败 (${status})`);
      }
    } else {
      // 其他错误
      console.error('❌ 未知错误类型');
      ElMessage.error('请求失败，请稍后重试');
    }
    
    return Promise.reject(error);
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
