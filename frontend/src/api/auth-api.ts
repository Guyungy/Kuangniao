import request from "@/utils/request";

const AUTH_BASE_URL = "/auth";

const AuthAPI = {
  /** 登录接口*/
  login(data: LoginFormData) {
    console.log('🔑 发起登录请求(准备)：', {
      url: `${AUTH_BASE_URL}/login`,
      method: 'post',
      payload: { username: data.username, password: '******' }
    });
    const startedAt = Date.now();
    return request<any, LoginResult>({
      url: `${AUTH_BASE_URL}/login`,
      method: "post",
      data: {
        username: data.username,
        password: data.password
      },
      headers: {
        "Content-Type": "application/json",
      },
    }).then(response => {
      const duration = Date.now() - startedAt;
      console.log(`🔑 登录请求成功，耗时 ${duration}ms`);
      console.log('登录响应:', response);
      console.log('登录响应类型:', typeof response);
      console.log('登录响应字段:', Object.keys(response || {}));
      console.log('登录响应data字段:', response?.data);
      console.log('accessToken:', response?.accessToken);
      console.log('refreshToken:', response?.refreshToken);
      return response;
    }).catch(err => {
      const duration = Date.now() - startedAt;
      console.error(`🔑 登录请求失败，耗时 ${duration}ms`, err);
      throw err;
    });
  },

  /** 刷新 token 接口*/
  refreshToken(refreshToken: string) {
    return request<any, LoginResult>({
      url: `${AUTH_BASE_URL}/refresh`,
      method: "post",
      data: { refreshToken },
      headers: {
        Authorization: "no-auth",
      },
    });
  },

  /** 退出登录接口 */
  logout() {
    return request({
      url: `${AUTH_BASE_URL}/logout`,
      method: "delete",
    });
  },


};

export default AuthAPI;

/** 登录表单数据 */
export interface LoginFormData {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 记住我 */
  rememberMe: boolean;
}

/** 登录响应 */
export interface LoginResult {
  /** 访问令牌 */
  accessToken: string;
  /** 刷新令牌 */
  refreshToken: string;
  /** 令牌类型 */
  tokenType: string;
  /** 过期时间(秒) */
  expiresIn: number;
}
