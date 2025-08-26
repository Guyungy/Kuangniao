<!-- 打手对账管理 -->
<template>
  <div class="app-container">
    <!-- 对账列表 -->
    <div>
      <!-- 搜索区域 -->
      <div class="search-container">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
          <el-form-item label="打手" prop="workerId">
            <el-select
              v-model="queryParams.workerId"
              placeholder="选择打手"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="worker in workerOptions"
                :key="worker.value"
                :label="worker.label"
                :value="worker.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="全部"
              clearable
              style="width: 120px"
            >
              <el-option label="待核账" value="pending" />
              <el-option label="已核账" value="confirmed" />
              <el-option label="有争议" value="disputed" />
            </el-select>
          </el-form-item>

          <el-form-item label="结算类型" prop="settlementType">
            <el-select
              v-model="queryParams.settlementType"
              placeholder="全部"
              clearable
              style="width: 120px"
            >
              <el-option label="日结" value="daily" />
              <el-option label="周结" value="weekly" />
              <el-option label="月结" value="monthly" />
            </el-select>
          </el-form-item>

          <el-form-item label="结算日期">
            <el-date-picker
              v-model="dateRange"
              :editable="false"
              type="daterange"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              @change="handleDateRangeChange"
            />
          </el-form-item>

          <el-form-item class="search-buttons">
            <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
            <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-card shadow="hover" class="data-table">
        <div class="data-table__toolbar">
          <div class="data-table__toolbar--actions">
            <el-button
              type="success"
              icon="plus"
              @click="handleOpenDialog()"
            >
              新增对账
            </el-button>
          </div>
        </div>

        <el-table
          v-loading="loading"
          :data="pageData"
          border
          stripe
          highlight-current-row
          class="data-table__content"
        >
          <el-table-column label="打手信息" min-width="150">
            <template #default="scope">
              <div>
                <div class="font-weight-bold">{{ scope.row.workerName }}</div>
                <div class="text-gray-500 text-sm">{{ scope.row.workerRealName }}</div>
                <div class="text-gray-500 text-sm">{{ scope.row.workerPhone }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="结算信息" min-width="120">
            <template #default="scope">
              <div>
                <el-tag :type="getSettlementTypeTagType(scope.row.settlementType)">
                  {{ getSettlementTypeText(scope.row.settlementType) }}
                </el-tag>
                <div class="text-gray-500 text-sm mt-1">
                  {{ formatDate(scope.row.startDate) }} ~ {{ formatDate(scope.row.endDate) }}
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="订单统计" min-width="120">
            <template #default="scope">
              <div>
                <div>订单数: {{ scope.row.orderCount }}</div>
                <div>总金额: ¥{{ scope.row.orderAmount }}</div>
                <div>总小时: {{ scope.row.totalHours }}h</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="金额信息" min-width="150">
            <template #default="scope">
              <div>
                <div>小时单价: ¥{{ scope.row.hourlyRate }}/h</div>
                <div>应得金额: ¥{{ scope.row.expectedAmount }}</div>
                <div>实发金额: ¥{{ scope.row.actualAmount }}</div>
                <div :class="getDifferenceAmountClass(scope.row.differenceAmount)">
                  差额: ¥{{ scope.row.differenceAmount }}
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="核账信息" min-width="120">
            <template #default="scope">
              <div v-if="scope.row.confirmedBy">
                <div>操作人: {{ scope.row.confirmedByUsername }}</div>
                <div class="text-gray-500 text-sm">{{ formatDateTime(scope.row.confirmedAt) }}</div>
                <div v-if="scope.row.confirmationNote" class="text-gray-500 text-sm">
                  备注: {{ scope.row.confirmationNote }}
                </div>
              </div>
              <span v-else class="text-gray-500">未核账</span>
            </template>
          </el-table-column>
          <el-table-column label="操作人" min-width="120">
            <template #default="scope">
              <span>{{ scope.row.confirmedByUsername || '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" min-width="260" align="left" fixed="right">
            <template #default="scope">
              <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                <el-button type="primary" icon="view" link size="small" @click="handleViewDetail(scope.row.id)">查看详情</el-button>
                <el-button v-if="scope.row.status === 'pending'" type="success" icon="check" link size="small" @click="handleConfirm(scope.row)">确认核账</el-button>
                <el-button v-if="scope.row.status === 'pending'" type="warning" icon="warning" link size="small" @click="handleDispute(scope.row)">标记争议</el-button>
                <el-button v-if="scope.row.status === 'pending'" type="primary" icon="edit" link size="small" @click="handleOpenDialog(scope.row.id)">编辑</el-button>
                <el-button v-if="scope.row.status === 'pending'" type="danger" icon="close" link size="small" @click="handleCancel(scope.row.id)">取消</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-if="total > 0"
          v-model:total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="handleQuery"
        />
      </el-card>
    </div>

    <!-- 对账表单弹窗 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      :size="drawerSize"
      direction="rtl"
    >
      <el-form
        ref="settlementFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="打手" prop="workerId">
          <el-select
            v-model="formData.workerId"
            placeholder="请选择打手"
            style="width: 100%"
            :disabled="!!formData.id"
            filterable
          >
            <el-option
              v-for="worker in workerOptions"
              :key="worker.value"
              :label="worker.label"
              :value="worker.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="结算类型" prop="settlementType">
          <el-select
            v-model="formData.settlementType"
            placeholder="请选择结算类型"
            style="width: 100%"
            :disabled="!!formData.id"
          >
            <el-option label="日结" value="daily" />
            <el-option label="周结" value="weekly" />
            <el-option label="月结" value="monthly" />
          </el-select>
        </el-form-item>

        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="formData.startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
            :disabled="!!formData.id"
          />
        </el-form-item>

        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="formData.endDate"
            type="date"
            placeholder="选择结束日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
            :disabled="!!formData.id"
          />
        </el-form-item>

        <el-form-item label="快捷日期">
          <el-button-group>
            <el-button size="small" @click="applyQuickRange('daily')">本日</el-button>
            <el-button size="small" @click="applyQuickRange('weekly')">本周</el-button>
            <el-button size="small" @click="applyQuickRange('monthly')">本月</el-button>
          </el-button-group>
        </el-form-item>

        <el-form-item label="实发金额" prop="actualAmount">
          <el-input-number
            v-model="formData.actualAmount"
            placeholder="请输入实发金额"
            style="width: 100%"
            :precision="2"
            :min="0"
          />
        </el-form-item>

        <el-form-item label="差额说明" prop="differenceReason">
          <el-input
            v-model="formData.differenceReason"
            type="textarea"
            placeholder="请输入差额说明"
            :rows="3"
          />
        </el-form-item>
      </el-form>

      <el-card shadow="never" class="mb-4" v-if="dialog.visible">
        <template #header>
          <div>对账预览</div>
        </template>
        <div v-loading="previewLoading">
          <div v-if="previewData">
            <div>订单数：{{ previewData.orderCount }}，流水：¥{{ previewData.orderAmount }}，总小时：{{ previewData.totalHours }}h</div>
            <div>小时单价：¥{{ previewData.hourlyRate }}/h</div>
            <div class="text-gray-500 text-sm">操作人：{{ previewData.operatorName || '-' }}，老板：{{ previewData.bossName || '-' }}</div>

            <el-table :data="incomeRows" border size="small" class="mt-1">
              <el-table-column label="项目" prop="label" />
              <el-table-column label="数值">
                <template #default="scope">{{ scope.row.value }}</template>
              </el-table-column>
            </el-table>
            <div class="text-gray-500 text-sm mt-1">应得金额（用于对账）：¥{{ previewData.expectedAmount }}</div>
            <div class="text-gray-500 text-sm">{{ formData.startDate }} ~ {{ formData.endDate }}</div>
            <div class="mt-1" v-if="(previewData.orders?.length || 0) > 0">
              <div class="text-gray-500 text-sm mb-4">共 {{ previewData.orders?.length || 0 }} 条</div>
              <el-table :data="previewData.orders || []" border stripe size="small">
                <el-table-column label="订单号" prop="id" width="100" />
                <el-table-column label="金额" width="120">
                  <template #default="scope">¥{{ scope.row.priceFinal }}</template>
                </el-table-column>
                <el-table-column label="服务小时" prop="serviceHours" width="100" />
                <el-table-column label="时间" width="180">
                  <template #default="scope">{{ new Date(scope.row.createTime).toLocaleString('zh-CN') }}</template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          <div v-else class="text-gray-500">请选择打手和日期范围，系统将自动预览统计</div>
        </div>
      </el-card>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 核账确认弹窗 -->
    <el-dialog
      v-model="confirmDialog.visible"
      title="确认核账"
      width="500px"
    >
      <el-form :model="confirmForm" label-width="80px">
        <el-form-item label="核账备注">
          <el-input
            v-model="confirmForm.note"
            type="textarea"
            placeholder="请输入核账备注（可选）"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleConfirmSubmit">确认核账</el-button>
          <el-button @click="confirmDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 标记争议弹窗 -->
    <el-dialog
      v-model="disputeDialog.visible"
      title="标记争议"
      width="500px"
    >
      <el-form :model="disputeForm" label-width="80px">
        <el-form-item label="争议原因" prop="reason">
          <el-input
            v-model="disputeForm.reason"
            type="textarea"
            placeholder="请输入争议原因"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleDisputeSubmit">确认标记</el-button>
          <el-button @click="disputeDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/modules/app-store";
import { DeviceEnum } from "@/enums/settings/device.enum";
import WorkerSettlementAPI, { 
  SettlementForm, 
  SettlementPageQuery, 
  SettlementPageVO,
  SettlementDetailVO 
} from "@/api/worker-settlement";
import WorkerAPI from "@/api/worker";

defineOptions({
  name: "WorkerSettlement",
  inheritAttrs: false,
});

const appStore = useAppStore();

const queryFormRef = ref();
const settlementFormRef = ref();

const queryParams = reactive<SettlementPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<SettlementPageVO[]>();
const total = ref(0);
const loading = ref(false);
const dateRange = ref<[string, string]>();

const dialog = reactive({
  visible: false,
  title: "新增对账",
});
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

const formData = reactive<SettlementForm>({
  workerId: 0,
  settlementType: 'daily',
  startDate: '',
  endDate: '',
  actualAmount: 0,
  differenceReason: '',
});

// 预览数据
const previewLoading = ref(false);
const previewData = ref<{ orderCount: number; orderAmount: number; totalHours: number; hourlyRate: number; expectedAmount: number; commissionRate: number; workerShare: number; platformProfit: number; operatorName?: string; bossName?: string; orders?: Array<{ id: number; priceFinal: number; serviceHours: number; createTime: string }> } | null>(null);
const incomeRows = computed(() => {
  if (!previewData.value) return [] as Array<{ label: string; value: string }>;
  return [
    { label: '流水', value: `¥${previewData.value.orderAmount}` },
    { label: '分成比例', value: formatRate(previewData.value.commissionRate) },
    { label: '打手收入', value: `¥${previewData.value.workerShare}` }
  ];
});
const previewPage = ref(1);
const previewPageSize = ref(10);
const previewPagedOrders = computed(() => {
  const list = previewData.value?.orders || [];
  const start = (previewPage.value - 1) * previewPageSize.value;
  return list.slice(start, start + previewPageSize.value);
});

const rules = reactive({
  workerId: [{ required: true, message: "请选择打手", trigger: "change" }],
  settlementType: [{ required: true, message: "请选择结算类型", trigger: "change" }],
  startDate: [{ required: true, message: "请选择开始日期", trigger: "change" }],
  endDate: [{ required: true, message: "请选择结束日期", trigger: "change" }],
  actualAmount: [{ required: true, message: "请输入实发金额", trigger: "blur" }],
});

// 打手选项
const workerOptions = ref<{ value: number; label: string }[]>([]);

// 核账确认弹窗
const confirmDialog = reactive({
  visible: false,
});
const confirmForm = reactive({
  id: 0,
  note: '',
});

// 标记争议弹窗
const disputeDialog = reactive({
  visible: false,
});
const disputeForm = reactive({
  id: 0,
  reason: '',
});

// 获取数据
async function fetchData() {
  loading.value = true;
  try {
    const data = await WorkerSettlementAPI.getPage(queryParams);
    pageData.value = data.list;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

// 查询
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value?.resetFields();
  dateRange.value = undefined;
  queryParams.workerId = undefined;
  queryParams.status = undefined;
  queryParams.settlementType = undefined;
  queryParams.startDate = undefined;
  queryParams.endDate = undefined;
  handleQuery();
}

// 日期范围变化处理
function handleDateRangeChange(dates: [string, string] | null) {
  if (dates) {
    queryParams.startDate = dates[0];
    queryParams.endDate = dates[1];
  } else {
    queryParams.startDate = undefined;
    queryParams.endDate = undefined;
  }
}

// 打开弹窗
async function handleOpenDialog(id?: number) {
  dialog.visible = true;
  
  if (id) {
    dialog.title = "编辑对账";
    try {
      const data = await WorkerSettlementAPI.getDetail(id);
      Object.assign(formData, {
        workerId: data.workerId,
        settlementType: data.settlementType,
        startDate: data.startDate,
        endDate: data.endDate,
        actualAmount: data.actualAmount,
        differenceReason: data.differenceReason,
      });
      formData.id = id;
      // 加载完成后立即预览
      triggerPreview();
    } catch (error) {
      console.error("获取对账详情失败:", error);
    }
  } else {
    dialog.title = "新增对账";
    formData.id = undefined;
    Object.assign(formData, {
      workerId: 0,
      settlementType: 'daily',
      startDate: getToday(),
      endDate: getToday(),
      actualAmount: 0,
      differenceReason: '',
    });
    previewData.value = null;
    // 进入新增时按默认日期进行预览（需先选择打手后再触发）
    // triggerPreview 将在选择打手后自动触发
  }
}

// 关闭弹窗
function handleCloseDialog() {
  dialog.visible = false;
  settlementFormRef.value?.resetFields();
  settlementFormRef.value?.clearValidate();
  formData.id = undefined;
}

// 提交表单
const handleSubmit = useDebounceFn(() => {
  settlementFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      const settlementId = formData.id;
      loading.value = true;
      
      if (settlementId) {
        WorkerSettlementAPI.update(settlementId, formData)
          .then(() => {
            ElMessage.success("更新对账记录成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        WorkerSettlementAPI.create(formData)
          .then(() => {
            ElMessage.success("创建对账记录成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}, 1000);

// 生成今天日期字符串
function getToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 根据类型应用快捷日期
function applyQuickRange(type: 'daily' | 'weekly' | 'monthly') {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);
  if (type === 'daily') {
    // 本日
  } else if (type === 'weekly') {
    const day = now.getDay() || 7; // 周一为1
    start.setDate(now.getDate() - (day - 1));
    end.setDate(start.getDate() + 6);
  } else if (type === 'monthly') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }
  formData.settlementType = type;
  formData.startDate = formatDateStr(start);
  formData.endDate = formatDateStr(end);
}

function formatDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 触发预览（防抖）
const triggerPreview = useDebounceFn(async () => {
  if (!formData.workerId || !formData.startDate || !formData.endDate) {
    previewData.value = null;
    return;
  }
  previewLoading.value = true;
  try {
    const data = await WorkerSettlementAPI.preview({
      workerId: formData.workerId,
      settlementType: formData.settlementType,
      startDate: formData.startDate,
      endDate: formData.endDate
    });
    previewData.value = {
      orderCount: data.orderCount,
      orderAmount: data.orderAmount,
      totalHours: data.totalHours,
      hourlyRate: data.hourlyRate,
      expectedAmount: data.expectedAmount,
      commissionRate: data.commissionRate || 0,
      workerShare: data.workerShare || 0,
      platformProfit: data.platformProfit || 0,
      operatorName: data.operatorName || '',
      bossName: data.bossName || '',
      orders: data.orders || []
    };
    previewPage.value = 1;
    // 若用户未手动填写，默认用应得金额作为实发初值，便于确认
    if (!formData.actualAmount || formData.actualAmount === 0) {
      formData.actualAmount = Number(data.expectedAmount || 0);
    }
  } catch (e) {
    previewData.value = null;
  } finally {
    previewLoading.value = false;
  }
}, 200);

watch(() => [formData.workerId, formData.settlementType, formData.startDate, formData.endDate], () => {
  triggerPreview();
});

function formatRate(rate: number) {
  return `${Math.round(Number(rate || 0) * 10000) / 100}%`;
}

// 查看详情
function handleViewDetail(id: number) {
  // 这里可以跳转到详情页面或打开详情弹窗
  ElMessage.info("查看详情功能待实现");
}

// 确认核账
function handleConfirm(settlement: SettlementPageVO) {
  confirmForm.id = settlement.id;
  confirmForm.note = '';
  confirmDialog.visible = true;
}

// 提交核账确认
function handleConfirmSubmit() {
  loading.value = true;
  WorkerSettlementAPI.confirm(confirmForm.id, confirmForm.note)
    .then(() => {
      ElMessage.success("核账确认成功");
      confirmDialog.visible = false;
      handleQuery();
    })
    .finally(() => (loading.value = false));
}

// 标记争议
function handleDispute(settlement: SettlementPageVO) {
  disputeForm.id = settlement.id;
  disputeForm.reason = '';
  disputeDialog.visible = true;
}

// 提交争议标记
function handleDisputeSubmit() {
  if (!disputeForm.reason.trim()) {
    ElMessage.warning("请输入争议原因");
    return;
  }
  
  loading.value = true;
  WorkerSettlementAPI.dispute(disputeForm.id, disputeForm.reason)
    .then(() => {
      ElMessage.success("标记争议成功");
      disputeDialog.visible = false;
      handleQuery();
    })
    .finally(() => (loading.value = false));
}

// 删除对账记录
function handleDelete(id: number) {
  ElMessageBox.confirm("确认删除该对账记录?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    loading.value = true;
    WorkerSettlementAPI.delete(id)
      .then(() => {
        ElMessage.success("删除成功");
        handleQuery();
      })
      .finally(() => (loading.value = false));
  });
}

// 取消对账记录（替代删除）
function handleCancel(id: number) {
  ElMessageBox.confirm("确认取消该对账记录? 将保留痕迹。", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "关闭",
    type: "warning",
  }).then(() => {
    loading.value = true;
    WorkerSettlementAPI.delete(id)
      .then(() => {
        ElMessage.success("已取消对账记录");
        handleQuery();
      })
      .finally(() => (loading.value = false));
  });
}

// 加载打手选项
const loadWorkerOptions = async () => {
  try {
    const response = await WorkerAPI.getOptions();
    workerOptions.value = response;
  } catch (error) {
    console.error("获取打手选项失败:", error);
  }
};

// 获取状态标签类型
function getStatusTagType(status: string) {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    confirmed: 'success',
    disputed: 'danger'
  };
  return typeMap[status] || 'info';
}

// 获取状态文本
function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    pending: '待核账',
    confirmed: '已核账',
    disputed: '有争议'
  };
  return textMap[status] || status;
}

// 获取结算类型标签类型
function getSettlementTypeTagType(type: string) {
  const typeMap: Record<string, string> = {
    daily: 'primary',
    weekly: 'success',
    monthly: 'warning'
  };
  return typeMap[type] || 'info';
}

// 获取结算类型文本
function getSettlementTypeText(type: string) {
  const textMap: Record<string, string> = {
    daily: '日结',
    weekly: '周结',
    monthly: '月结'
  };
  return textMap[type] || type;
}

// 获取差额金额样式类
function getDifferenceAmountClass(amount: number) {
  if (amount > 0) return 'text-success';
  if (amount < 0) return 'text-danger';
  return 'text-gray-500';
}

// 格式化日期
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN');
}

// 格式化日期时间
function formatDateTime(dateTime: string) {
  return new Date(dateTime).toLocaleString('zh-CN');
}

// 初始化
onMounted(() => {
  handleQuery();
  loadWorkerOptions();
});
</script>

<style lang="scss" scoped>
.search-container {
  margin-bottom: 20px;
}

.data-table {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

.font-weight-bold {
  font-weight: bold;
}

.text-gray-500 {
  color: #6b7280;
}

.text-success {
  color: #10b981;
}

.text-danger {
  color: #ef4444;
}

.text-sm {
  font-size: 12px;
}

.mt-1 {
  margin-top: 4px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
