import request from '@/utils/request';

const ORDER_BASE_URL = '/orders';

export interface OrderQuery {
  keyword?: string;
  payMethod?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  limit?: number;
}

export interface OrderVO {
  id: string;
  orderNo: string;
  memberId: string;
  memberUsername: string;
  memberNickname: string;
  workerId: string;
  workerUsername: string;
  workerNickname: string;
  serviceHours: number;
  amount: number;
  payMethod: string;
  createTime: string;
  remark?: string;
}

export interface OrderForm {
  id?: string;
  memberId: string;
  workerId: string;
  serviceHours: number;
  amount: number;
  payMethod: string;
  payBalance?: number;
  payScan?: number;
  remark?: string;
}

export interface OrderStats {
  todayAmount: number;
  todayCount: number;
  monthAmount: number;
  monthCount: number;
  balancePayAmount: number;
  balancePayCount: number;
  qrcodePayAmount: number;
  qrcodePayCount: number;
}

// 数据映射函数
function mapOrderFromBackend(item: any): OrderVO {
  // 支付方式映射
  const getPayMethodText = (method: string) => {
    const methodMap: Record<string, string> = {
      'balance': '余额支付',
      'scan': '扫码支付',
      'qrcode': '扫码支付'
    };
    return methodMap[method] || method;
  };

  return {
    id: String(item.id),
    orderNo: item.order_number || item.order_no || item.orderNo || '',
    memberId: String(item.member_id || item.memberId || ''),
    memberUsername: item.member?.username || item.memberUsername || '',
    memberNickname: item.member?.nickname || item.memberNickname || '',
    workerId: String(item.worker_id || item.workerId || ''),
    workerUsername: item.worker?.username || item.workerUsername || '',
    workerNickname: item.worker?.name || item.workerNickname || '',
    serviceHours: Number(item.duration || item.serviceHours || 0),
    amount: Number(item.price_final || item.amount || 0),
    payMethod: getPayMethodText(item.pay_method || item.payMethod || ''),
    createTime: item.created_at || item.createdAt || item.createTime || '',
    remark: item.remark || ''
  };
}

const OrderAPI = {
  /** 获取订单分页列表 */
  getPage(params: OrderQuery) {
    // 转换参数名称以匹配后端API，并过滤空值
    const backendParams: any = {};
    
    // 只添加非空参数
    if (params.page) backendParams.page = params.page;
    if (params.limit) backendParams.limit = params.limit;
    if (params.keyword && params.keyword.trim()) backendParams.keyword = params.keyword.trim();
    if (params.payMethod && params.payMethod.trim()) backendParams.pay_method = params.payMethod.trim();
    if (params.startTime && params.startTime.trim()) backendParams.start_date = params.startTime.trim();
    if (params.endTime && params.endTime.trim()) backendParams.end_date = params.endTime.trim();

    console.log('订单API调用:', {
      url: ORDER_BASE_URL,
      params: backendParams,
      originalParams: params
    });

    // 添加时间戳避免缓存
    backendParams._t = Date.now();
    
    return request<any, any>({
      url: ORDER_BASE_URL,
      method: 'get',
      params: backendParams
    }).then(response => {
      // 直接返回数据，不做复杂处理
      if (response && response.list) {
        const mappedList = response.list.map((item: any) => mapOrderFromBackend(item));
        return {
          list: mappedList,
          total: Number(response.total || 0)
        };
      }
      return { list: [], total: 0 };
    }).catch((error) => {
      console.error('订单API调用失败:', error);
      throw error;
    });
  },

  /** 获取订单详情 */
  getDetail(id: string) {
    return request<any, any>({
      url: `${ORDER_BASE_URL}/${id}`,
      method: 'get'
    }).then(response => {
      // response 现在是实际数据，直接使用
      if (response) {
        return mapOrderFromBackend(response);
      }
      throw new Error('订单详情数据格式错误');
    }).catch((error) => {
      console.error('获取订单详情失败:', error);
      throw error;
    });
  },

  /** 新增订单 */
  create(data: OrderForm) {
    // 转换参数名称以匹配后端API
    const backendData: any = {
      member_id: data.memberId,
      worker_id: data.workerId,
      duration: data.serviceHours,
      pay_method: data.payMethod,
      remark: data.remark
    };

    // 根据支付方式添加相应的支付金额
    if (data.payMethod === 'balance') {
      backendData.pay_balance = data.amount;
      backendData.pay_scan = 0;
    } else if (data.payMethod === 'scan') {
      backendData.pay_balance = 0;
      backendData.pay_scan = data.amount;
    } else if (data.payMethod === 'mixed') {
      backendData.pay_balance = data.payBalance || 0;
      backendData.pay_scan = data.payScan || 0;
    }

    console.log('转换后的后端数据:', backendData);

    console.log('订单创建API调用:', {
      url: ORDER_BASE_URL,
      data: backendData,
      originalData: data
    });

    return request({
      url: ORDER_BASE_URL,
      method: 'post',
      data: backendData
    }).then(response => {
      console.log('订单创建API响应:', response);
      
      // 验证响应数据
      if (response && response.data && response.data.id) {
        console.log('订单创建成功，返回订单记录:', response.data);
        return response.data;
      } else {
        console.error('订单创建响应数据格式错误:', response);
        throw new Error('订单创建响应数据格式错误');
      }
    }).catch((error) => {
      console.error('订单创建API调用失败:', error);
      console.error('错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    });
  },

  /** 更新订单 */
  update(id: string, data: OrderForm) {
    return request({
      url: `${ORDER_BASE_URL}/${id}`,
      method: 'put',
      data
    });
  },

  /** 删除订单 */
  delete(id: string) {
    return request({
      url: `${ORDER_BASE_URL}/${id}`,
      method: 'delete'
    });
  },

  /** 获取订单统计数据 */
  getStats() {
    return request<any, any>({
      url: `${ORDER_BASE_URL}/stats/summary`,
      method: 'get'
    }).then(response => {
      // response 现在是实际数据，直接使用
      return response;
    }).catch((error) => {
      console.error('获取订单统计数据失败:', error);
      throw error;
    });
  },

  /** 计算订单金额 */
  calculateAmount(workerId: string, serviceHours: number) {
    return request<any, any>({
      url: `${ORDER_BASE_URL}/calculate-price`,
      method: 'post',
      data: { worker_id: workerId, duration: serviceHours }
    }).then(response => {
      console.log('计算价格API响应:', response);
      // 后端返回的是 { data: { price_final: number } }
      return { amount: response.data?.price_final || 0 };
    });
  },

  /** 导出订单列表 */
  export(params: OrderQuery) {
    // 转换参数名称以匹配后端API
    const backendParams: any = {};
    
    // 只添加非空参数
    if (params.page) backendParams.page = params.page;
    if (params.limit) backendParams.limit = params.limit;
    if (params.keyword && params.keyword.trim()) backendParams.keyword = params.keyword.trim();
    if (params.payMethod && params.payMethod.trim()) backendParams.pay_method = params.payMethod.trim();
    if (params.startTime && params.startTime.trim()) backendParams.start_date = params.startTime.trim();
    if (params.endTime && params.endTime.trim()) backendParams.end_date = params.endTime.trim();

    return request({
      url: `${ORDER_BASE_URL}/export`,
      method: 'get',
      params: backendParams,
      responseType: 'blob'
    }).then(response => {
      // 直接返回blob响应
      return response;
    }).catch((error) => {
      console.error('导出订单失败:', error);
      throw error;
    });
  }
};

export default OrderAPI;