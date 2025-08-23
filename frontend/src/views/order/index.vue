<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键词" prop="keyword">
          <el-input
            v-model="queryParams.keyword"
            placeholder="订单号/会员昵称/打手昵称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="支付方式" prop="payMethod">
          <el-select v-model="queryParams.payMethod" placeholder="请选择" clearable style="width: 120px">
            <el-option label="余额" value="balance" />
            <el-option label="扫码" value="scan" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <i-ep-search />搜索
          </el-button>
          <el-button @click="handleResetQuery">
            <i-ep-refresh />重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never" class="table-container">
      <template #header>
        <div class="flex-x-between">
          <div class="flex-y-center">
            <i-ep-shopping-cart class="mr-1" />订单列表
          </div>
          <div>
            <el-button type="success" @click="handleOpenDialog()">
              <i-ep-plus />新增订单
            </el-button>
            <el-button type="info" @click="handleExport">
              <i-ep-download />导出
            </el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="orderList" stripe>
        <el-table-column label="订单号" prop="orderNo" width="150" show-overflow-tooltip />
        <el-table-column label="会员信息" width="140">
          <template #default="scope">
            <div>
              <div class="font-medium">{{ scope.row.memberNickname }}</div>
              <div class="text-gray-500 text-sm">{{ scope.row.memberUsername }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="打手信息" width="140">
          <template #default="scope">
            <div>
              <div class="font-medium">{{ scope.row.workerNickname }}</div>
              <div class="text-gray-500 text-sm">{{ scope.row.workerUsername }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="服务时长" prop="serviceHours" width="100" align="center">
          <template #default="scope">
            <span class="text-blue-600">{{ scope.row.serviceHours }}小时</span>
          </template>
        </el-table-column>
        <el-table-column label="订单金额" prop="amount" width="110" align="right">
          <template #default="scope">
            <span class="text-red-600 font-medium">¥{{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付方式" prop="payMethod" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getPaymentMethodType(scope.row.payMethod)">
              {{ getPaymentMethodText(scope.row.payMethod) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="createTime" width="160" show-overflow-tooltip>
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="handleOpenDialog(scope.row.id)">
              <i-ep-edit />编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(scope.row.id)">
              <i-ep-delete />删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.page"
        v-model:limit="queryParams.limit"
        @pagination="handleQuery"
      />
    </el-card>

    <!-- 订单表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="700px"
      @close="handleCloseDialog"
    >
      <el-form
        ref="orderFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="选择会员" prop="memberId">
              <div class="flex items-center">
                <el-input
                  v-model="selectedMemberText"
                  placeholder="请选择会员"
                  readonly
                  style="width: 100%"
                  @click="showMemberDialog = true"
                />
                <el-button type="primary" @click="showMemberDialog = true" class="ml-2">
                  <i-ep-search />选择
                </el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="会员余额">
              <el-input :value="`¥${memberBalance}`" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="选择打手" prop="workerId">
              <div class="flex items-center">
                <el-input
                  v-model="selectedWorkerText"
                  placeholder="请选择打手"
                  readonly
                  style="width: 100%"
                  @click="showWorkerDialog = true"
                />
                <el-button type="primary" @click="showWorkerDialog = true" class="ml-2">
                  <i-ep-search />选择
                </el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="小时单价">
              <el-input :value="`¥${hourlyRate}/小时`" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="服务时长" prop="serviceHours">
              <el-input-number
                v-model="formData.serviceHours"
                :min="0.5"
                :step="0.5"
                :precision="1"
                style="width: 100%"
                placeholder="请输入服务时长"
                @change="calculateAmount"
              />
              <span class="ml-2 text-gray-500">小时</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单金额">
              <el-input :value="`¥${calculatedAmount}`" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 价格显示区域 -->
        <el-card shadow="never" class="price-card mb-4">
          <div class="price-row total">
            <span>订单金额：</span>
            <span class="text-red-600 font-bold text-lg">¥{{ calculatedAmount }}</span>
          </div>
        </el-card>
        
        <el-form-item label="支付方式" prop="payMethod">
          <el-radio-group v-model="formData.payMethod">
            <el-radio value="balance">余额支付</el-radio>
            <el-radio value="scan">扫码支付</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :disabled="!canSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon bg-blue-100 text-blue-600">
              <i-ep-shopping-cart />
            </div>
            <div class="stat-content">
              <div class="stat-title">今日订单</div>
              <div class="stat-value text-blue-600">¥{{ statsData.todayAmount }}</div>
              <div class="stat-desc">{{ statsData.todayCount }}单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon bg-green-100 text-green-600">
              <i-ep-trend-charts />
            </div>
            <div class="stat-content">
              <div class="stat-title">本月订单</div>
              <div class="stat-value text-green-600">¥{{ statsData.monthAmount }}</div>
              <div class="stat-desc">{{ statsData.monthCount }}单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon bg-orange-100 text-orange-600">
              <i-ep-wallet />
            </div>
            <div class="stat-content">
              <div class="stat-title">余额支付</div>
              <div class="stat-value text-orange-600">¥{{ statsData.balancePayAmount }}</div>
              <div class="stat-desc">{{ statsData.balancePayCount }}单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon bg-purple-100 text-purple-600">
              <i-ep-credit-card />
            </div>
            <div class="stat-content">
              <div class="stat-title">扫码支付</div>
              <div class="stat-value text-purple-600">¥{{ statsData.qrcodePayAmount }}</div>
              <div class="stat-desc">{{ statsData.qrcodePayCount }}单</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 会员选择弹窗 -->
    <el-dialog
      v-model="showMemberDialog"
      title="选择会员"
      width="900px"
      @close="handleCloseMemberDialog"
    >
      <div class="mb-4">
        <el-input
          v-model="memberSearchKeyword"
          placeholder="搜索会员昵称、用户名或手机号"
          clearable
          style="width: 300px"
          @keyup.enter="handleMemberSearch"
        >
          <template #append>
            <el-button @click="handleMemberSearch">
              <i-ep-search />
            </el-button>
          </template>
        </el-input>
      </div>
      
      <el-table
        v-loading="memberLoading"
        :data="memberList"
        stripe
        @row-click="handleMemberSelect"
        style="cursor: pointer"
      >
        <el-table-column label="用户名" prop="username" width="120" show-overflow-tooltip />
        <el-table-column label="昵称" prop="nickname" width="120" show-overflow-tooltip />
        <el-table-column label="手机号" prop="phone" width="130" show-overflow-tooltip />
        <el-table-column label="余额" prop="balance" width="100" align="right">
          <template #default="scope">
            <span class="text-green-600">¥{{ scope.row.balance }}</span>
          </template>
        </el-table-column>
        <el-table-column label="累计充值" prop="totalRecharge" width="100" align="right">
          <template #default="scope">
            <span class="text-blue-600">¥{{ scope.row.totalRecharge }}</span>
          </template>
        </el-table-column>
        <el-table-column label="累计消费" prop="totalConsume" width="100" align="right">
          <template #default="scope">
            <span class="text-red-600">¥{{ scope.row.totalConsume }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="80" align="center">
          <template #default="scope">
            <el-tag :type="getMemberStatusType(scope.row.status)">
              {{ getMemberStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" prop="createTime" width="160" show-overflow-tooltip>
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
      </el-table>
      
      <pagination
        v-if="memberTotal > 0"
        v-model:total="memberTotal"
        v-model:page="memberQueryParams.page"
        v-model:limit="memberQueryParams.limit"
        @pagination="handleMemberQuery"
      />
    </el-dialog>

    <!-- 打手选择弹窗 -->
    <el-dialog
      v-model="showWorkerDialog"
      title="选择打手"
      width="900px"
      @close="handleCloseWorkerDialog"
    >
      <div class="mb-4">
        <el-input
          v-model="workerSearchKeyword"
          placeholder="搜索打手昵称、真实姓名或手机号"
          clearable
          style="width: 300px"
          @keyup.enter="handleWorkerSearch"
        >
          <template #append>
            <el-button @click="handleWorkerSearch">
              <i-ep-search />
            </el-button>
          </template>
        </el-input>
      </div>
      
      <el-table
        v-loading="workerLoading"
        :data="workerList"
        stripe
        @row-click="handleWorkerSelect"
        style="cursor: pointer"
      >
        <el-table-column label="昵称" prop="nickname" width="120" show-overflow-tooltip />
        <el-table-column label="真实姓名" prop="realName" width="120" show-overflow-tooltip />
        <el-table-column label="手机号" prop="phone" width="130" show-overflow-tooltip />
        <el-table-column label="每小时单价" prop="hourlyRate" width="120" align="right">
          <template #default="scope">
            <span class="text-red-600 font-medium">¥{{ scope.row.hourlyRate }}/小时</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="80" align="center">
          <template #default="scope">
            <el-tag :type="getWorkerStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="添加时间" prop="createTime" width="160" show-overflow-tooltip>
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
      </el-table>
      
      <pagination
        v-if="workerTotal > 0"
        v-model:total="workerTotal"
        v-model:page="workerQueryParams.page"
        v-model:limit="workerQueryParams.limit"
        @pagination="handleWorkerQuery"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import OrderAPI, { type OrderVO, type OrderForm, type OrderStats } from '@/api/order'
import MemberAPI, { type MemberVO } from '@/api/member'
import WorkerAPI, { type WorkerVO } from '@/api/worker'

defineOptions({
  name: 'Order',
  inheritAttrs: false
})

// 使用API定义的类型
type OrderItem = OrderVO

// 响应式数据
const queryFormRef = ref<FormInstance>()
const orderFormRef = ref<FormInstance>()
const loading = ref(false)
const total = ref(0)
const orderList = ref<OrderItem[]>([])
const memberOptions = ref<MemberVO[]>([])
const workerOptions = ref<WorkerVO[]>([])
const dateRange = ref([])
const memberBalance = ref(0)
const hourlyRate = ref(0)

// 会员选择相关
const showMemberDialog = ref(false)
const memberList = ref<MemberVO[]>([])
const memberLoading = ref(false)
const memberTotal = ref(0)
const memberSearchKeyword = ref('')
const selectedMemberText = ref('')
const memberQueryParams = reactive({
  page: 1,
  limit: 10,
  keyword: ''
})

// 打手选择相关
const showWorkerDialog = ref(false)
const workerList = ref<WorkerVO[]>([])
const workerLoading = ref(false)
const workerTotal = ref(0)
const workerSearchKeyword = ref('')
const selectedWorkerText = ref('')
const workerQueryParams = reactive({
  page: 1,
  limit: 10,
  keyword: ''
})

// 查询参数
const queryParams = reactive({
  page: 1,
  limit: 10,
  keyword: '',
  payMethod: '',
  startTime: '',
  endTime: ''
})

// 弹窗状态
const dialog = reactive({
  visible: false,
  title: ''
})

// 表单数据
const formData = reactive<OrderForm>({
  id: undefined,
  memberId: '',
  workerId: '',
  serviceHours: 1,
  amount: 0,
  payMethod: 'scan', // 默认使用扫码支付
  remark: ''
})

// 统计数据
const statsData = reactive<OrderStats>({
  todayAmount: 0,
  todayCount: 0,
  monthAmount: 0,
  monthCount: 0,
  balancePayAmount: 0,
  balancePayCount: 0,
  qrcodePayAmount: 0,
  qrcodePayCount: 0
})

// 计算属性
const calculatedAmount = computed(() => {
  return (formData.serviceHours * hourlyRate.value).toFixed(2)
})

const canSubmit = computed(() => {
  if (formData.payMethod === 'balance') {
    return memberBalance.value >= parseFloat(calculatedAmount.value)
  }
  return true
})

// 表单验证规则
const rules: FormRules = {
  memberId: [{ required: true, message: '请选择会员', trigger: 'change' }],
  workerId: [{ required: true, message: '请选择打手', trigger: 'change' }],
  serviceHours: [{ required: true, message: '请输入服务时长', trigger: 'blur' }],
  payMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }]
}

// 支付方式类型
const getPaymentMethodType = (method: string): 'success' | 'primary' | 'warning' | 'info' | 'danger' => {
  const typeMap: Record<string, 'success' | 'primary' | 'warning' | 'info' | 'danger'> = {
    balance: 'warning',
    scan: 'success',
    qrcode: 'success' // 兼容旧值
  }
  return typeMap[method] || 'info'
}

// 支付方式文本
const getPaymentMethodText = (method: string) => {
  const textMap: Record<string, string> = {
    balance: '余额支付',
    scan: '扫码支付',
    qrcode: '扫码支付' // 兼容旧值
  }
  return textMap[method] || '未知';
}

// 会员状态类型
const getMemberStatusType = (status: string): 'success' | 'danger' | 'warning' | 'info' => {
  const typeMap: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
    active: 'success',
    inactive: 'danger',
    pending: 'warning'
  }
  return typeMap[status] || 'info'
}

// 会员状态文本
const getMemberStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '正常',
    inactive: '禁用',
    pending: '待审核'
  }
  return textMap[status] || '未知'
}

// 打手状态类型
const getWorkerStatusType = (status: string): 'success' | 'danger' | 'warning' | 'info' => {
  const typeMap: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
    '可用': 'success',
    '忙碌': 'warning',
    '休息': 'info',
    '禁用': 'danger'
  }
  return typeMap[status] || 'info'
}



// 时间格式化函数
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  // 转换为北京时间（UTC+8）
  const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000)
  return beijingTime.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// 查询
const handleQuery = async () => {
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.startTime = dateRange.value[0]
    queryParams.endTime = dateRange.value[1]
  } else {
    queryParams.startTime = ''
    queryParams.endTime = ''
  }
  
  loading.value = true
  try {
    const result = await OrderAPI.getPage(queryParams)
    orderList.value = result.list
    total.value = result.total
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 重置查询
const handleResetQuery = () => {
  queryFormRef.value?.resetFields()
  dateRange.value = []
  handleQuery()
}

// 会员选择相关方法
const handleMemberSearch = () => {
  memberQueryParams.keyword = memberSearchKeyword.value
  memberQueryParams.page = 1
  handleMemberQuery()
}

const handleMemberQuery = async () => {
  memberLoading.value = true
  try {
    const result = await MemberAPI.getPage({
      keyword: memberQueryParams.keyword,
      page: memberQueryParams.page,
      limit: memberQueryParams.limit
    })
    memberList.value = result.list
    memberTotal.value = result.total
  } catch (error) {
    console.error('获取会员列表失败:', error)
    ElMessage.error('获取会员列表失败')
  } finally {
    memberLoading.value = false
  }
}

const handleMemberSelect = (row: MemberVO) => {
  formData.memberId = row.id
  memberBalance.value = row.balance
  selectedMemberText.value = `${row.nickname} (${row.username})`
  showMemberDialog.value = false
  calculateAmount()
}

const handleCloseMemberDialog = () => {
  showMemberDialog.value = false
  memberSearchKeyword.value = ''
  memberQueryParams.keyword = ''
  memberQueryParams.page = 1
}

// 打手选择相关方法
const handleWorkerSearch = () => {
  workerQueryParams.keyword = workerSearchKeyword.value
  workerQueryParams.page = 1
  handleWorkerQuery()
}

const handleWorkerQuery = async () => {
  workerLoading.value = true
  try {
    const result = await WorkerAPI.getPage({
      keyword: workerQueryParams.keyword,
      page: workerQueryParams.page,
      limit: workerQueryParams.limit
    })
    workerList.value = result.list
    workerTotal.value = result.total
  } catch (error) {
    console.error('获取打手列表失败:', error)
    ElMessage.error('获取打手列表失败')
  } finally {
    workerLoading.value = false
  }
}

const handleWorkerSelect = (row: WorkerVO) => {
  formData.workerId = row.id
  hourlyRate.value = row.hourlyRate
  selectedWorkerText.value = `${row.nickname} (¥${row.hourlyRate}/小时)`
  showWorkerDialog.value = false
  calculateAmount()
}

const handleCloseWorkerDialog = () => {
  showWorkerDialog.value = false
  workerSearchKeyword.value = ''
  workerQueryParams.keyword = ''
  workerQueryParams.page = 1
}

// 计算金额
const calculateAmount = async () => {
  console.log('计算金额开始:', { workerId: formData.workerId, serviceHours: formData.serviceHours });
  if (formData.workerId && formData.serviceHours > 0) {
    try {
      const result = await OrderAPI.calculateAmount(formData.workerId, formData.serviceHours)
      formData.amount = result.amount
      console.log('API计算金额结果:', result.amount);
    } catch (error) {
      console.error('计算金额失败:', error)
      // 如果API调用失败，使用本地计算
      formData.amount = parseFloat(calculatedAmount.value)
      console.log('本地计算金额结果:', formData.amount);
    }
  } else {
    console.log('计算金额条件不满足');
  }
}

// 打开弹窗
const handleOpenDialog = async (id?: string) => {
  dialog.visible = true
  // 重置选择文本
  selectedMemberText.value = ''
  selectedWorkerText.value = ''
  
  if (id) {
    dialog.title = '编辑订单'
    try {
      const data = await OrderAPI.getDetail(id)
      console.log('获取到的订单详情:', data);
      Object.assign(formData, {
        id: data.id,
        memberId: data.memberId,
        workerId: data.workerId,
        serviceHours: data.serviceHours,
        amount: data.amount,
        payMethod: data.payMethod,
        remark: data.remark
      })
      // 设置选中文本
      selectedMemberText.value = `${data.memberNickname} (${data.memberUsername})`
      selectedWorkerText.value = `${data.workerNickname} (¥${data.amount / data.serviceHours}/小时)`
      // 设置余额和单价
      memberBalance.value = 0 // 编辑时暂时设为0，实际应该从会员详情获取
      hourlyRate.value = data.amount / data.serviceHours
    } catch (error) {
      console.error('获取订单详情失败:', error)
      ElMessage.error('获取订单详情失败')
    }
  } else {
    dialog.title = '新增订单'
    Object.assign(formData, {
      id: undefined,
      memberId: '',
      workerId: '',
      serviceHours: 1,
      amount: 0,
      payMethod: 'balance',
      remark: ''
    })
    memberBalance.value = 0
    hourlyRate.value = 0
  }
}

// 关闭弹窗
const handleCloseDialog = () => {
  dialog.visible = false
  orderFormRef.value?.resetFields()
  // 清理选择相关数据
  selectedMemberText.value = ''
  selectedWorkerText.value = ''
  memberBalance.value = 0
  hourlyRate.value = 0
}

// 提交表单
const handleSubmit = async () => {
  if (!orderFormRef.value) return
  
  const valid = await orderFormRef.value.validate().catch(() => false)
  if (!valid) return
  
  // 确保使用计算出的金额
  formData.amount = parseFloat(calculatedAmount.value)
  console.log('提交订单，金额:', formData.amount);
  
  if (formData.payMethod === 'balance' && memberBalance.value < formData.amount) {
    ElMessage.error('会员余额不足')
    return
  }
  
  try {
    if (formData.id) {
      await OrderAPI.update(formData.id, formData)
      ElMessage.success('订单更新成功')
    } else {
      console.log('开始创建订单，表单数据:', formData);
      const result = await OrderAPI.create(formData)
      console.log('订单创建API返回结果:', result);
      ElMessage.success('订单创建成功')
    }
    handleCloseDialog()
    handleQuery()
    loadStats()
  } catch (error: any) {
    console.error('保存订单失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    ElMessage.error('保存订单失败')
  }
}

// 删除
const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认删除该订单吗？删除后会回滚会员余额。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await OrderAPI.delete(id)
    ElMessage.success('删除成功')
    handleQuery()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除订单失败:', error)
      ElMessage.error('删除订单失败')
    }
  }
}

// 导出
const handleExport = async () => {
  try {
    const blob = await OrderAPI.export(queryParams)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `订单列表_${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const { data } = await OrderAPI.getStats()
    Object.assign(statsData, data)
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 初始化
onMounted(async () => {
  await handleQuery()
  await loadStats()
  // 初始化会员和打手列表
  await handleMemberQuery()
  await handleWorkerQuery()
})
</script>

<style lang="scss" scoped>
.search-container {
  margin-bottom: 20px;
}

.table-container {
  margin-bottom: 20px;
}

.price-card {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  
  .price-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &.total {
      border-top: 1px solid #dee2e6;
      padding-top: 8px;
      margin-top: 8px;
    }
  }
}

.payment-detail {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 16px;
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-right: 16px;
  }
  
  .stat-content {
    flex: 1;
    
    .stat-title {
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .stat-desc {
      font-size: 12px;
      color: #999;
    }
  }
}
</style>