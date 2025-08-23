<template>
  <div class="app-container">
    <!-- 今日概览 -->
    <el-card shadow="never" class="overview-card mb-4">
      <template #header>
        <div class="flex-x-between">
          <div class="flex-y-center">
            <i-ep-data-analysis class="mr-1" />今日概览
          </div>
          <div class="text-gray-500 text-sm">
            {{ currentDate }}
          </div>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="overview-item">
            <div class="overview-icon bg-blue-100 text-blue-600">
              <i-ep-shopping-cart />
            </div>
            <div class="overview-content">
              <div class="overview-title">订单数量</div>
              <div class="overview-value text-blue-600">{{ todayOverview.orderCount }}</div>
              <div class="overview-desc">订单金额 ¥{{ todayOverview.orderAmount }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="overview-item">
            <div class="overview-icon bg-green-100 text-green-600">
              <i-ep-wallet />
            </div>
            <div class="overview-content">
              <div class="overview-title">充值数量</div>
              <div class="overview-value text-green-600">{{ todayOverview.rechargeCount }}</div>
              <div class="overview-desc">充值金额 ¥{{ todayOverview.rechargeAmount }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="overview-item">
            <div class="overview-icon bg-orange-100 text-orange-600">
              <i-ep-user />
            </div>
            <div class="overview-content">
              <div class="overview-title">新增会员</div>
              <div class="overview-value text-orange-600">{{ todayOverview.newMembers }}</div>
              <div class="overview-desc">总会员 {{ todayOverview.totalMembers }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="overview-item">
            <div class="overview-icon bg-purple-100 text-purple-600">
              <i-ep-user-filled />
            </div>
            <div class="overview-content">
              <div class="overview-title">活跃打手</div>
              <div class="overview-value text-purple-600">{{ todayOverview.activeWorkers }}</div>
              <div class="overview-desc">总打手 {{ todayOverview.totalWorkers }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="overview-item">
            <div class="overview-icon bg-red-100 text-red-600">
              <i-ep-money />
            </div>
            <div class="overview-content">
              <div class="overview-title">总收入</div>
              <div class="overview-value text-red-600">¥{{ todayOverview.totalIncome }}</div>
              <div class="overview-desc">较昨日 {{ todayOverview.incomeChange >= 0 ? '+' : '' }}{{ todayOverview.incomeChange }}%</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="overview-item">
            <div class="overview-icon bg-cyan-100 text-cyan-600">
              <i-ep-trend-charts />
            </div>
            <div class="overview-content">
              <div class="overview-title">平台余额</div>
              <div class="overview-value text-cyan-600">¥{{ todayOverview.platformBalance }}</div>
              <div class="overview-desc">可提现余额</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20">
      <!-- 趋势图表 -->
      <el-col :span="16">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="flex-x-between">
              <div class="flex-y-center">
                <i-ep-trend-charts class="mr-1" />趋势分析
              </div>
              <div>
                <el-radio-group v-model="trendType" size="small" @change="loadTrendData">
                  <el-radio-button value="order">订单趋势</el-radio-button>
                  <el-radio-button value="recharge">充值趋势</el-radio-button>
                </el-radio-group>
                <el-select v-model="trendPeriod" size="small" style="width: 100px; margin-left: 10px" @change="loadTrendData">
                  <el-option label="7天" value="7" />
                  <el-option label="30天" value="30" />
                  <el-option label="90天" value="90" />
                </el-select>
              </div>
            </div>
          </template>
          
          <div ref="trendChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      
      <!-- 支付方式分布 -->
      <el-col :span="8">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="flex-y-center">
              <i-ep-pie-chart class="mr-1" />支付方式分布
            </div>
          </template>
          
          <div ref="paymentChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <!-- 会员排行榜 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="flex-x-between">
              <div class="flex-y-center">
                <i-ep-trophy class="mr-1" />会员消费排行榜
              </div>
              <el-select v-model="memberRankingPeriod" size="small" style="width: 100px" @change="loadMemberRanking">
                <el-option label="今日" value="today" />
                <el-option label="本周" value="week" />
                <el-option label="本月" value="month" />
              </el-select>
            </div>
          </template>
          
          <div class="ranking-list">
            <div v-for="(item, index) in memberRanking" :key="item.id" class="ranking-item">
              <div class="ranking-number">
                <el-tag v-if="index < 3" :type="getRankingType(index)" size="small">
                  {{ index + 1 }}
                </el-tag>
                <span v-else class="text-gray-500">{{ index + 1 }}</span>
              </div>
              <div class="ranking-avatar">
                <el-avatar :src="item.avatar" :size="32">
                  <i-ep-user />
                </el-avatar>
              </div>
              <div class="ranking-info">
                <div class="ranking-name">{{ item.nickname }}</div>
                <div class="ranking-desc">{{ item.phone }}</div>
              </div>
              <div class="ranking-value">
                <div class="ranking-amount">¥{{ item.amount }}</div>
                <div class="ranking-count">{{ item.orderCount }}单</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 打手排行榜 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="flex-x-between">
              <div class="flex-y-center">
                <i-ep-medal class="mr-1" />打手收入排行榜
              </div>
              <el-select v-model="workerRankingPeriod" size="small" style="width: 100px" @change="loadWorkerRanking">
                <el-option label="今日" value="today" />
                <el-option label="本周" value="week" />
                <el-option label="本月" value="month" />
              </el-select>
            </div>
          </template>
          
          <div class="ranking-list">
            <div v-for="(item, index) in workerRanking" :key="item.id" class="ranking-item">
              <div class="ranking-number">
                <el-tag v-if="index < 3" :type="getRankingType(index)" size="small">
                  {{ index + 1 }}
                </el-tag>
                <span v-else class="text-gray-500">{{ index + 1 }}</span>
              </div>
              <div class="ranking-avatar">
                <el-avatar :src="item.avatar" :size="32">
                  <i-ep-user-filled />
                </el-avatar>
              </div>
              <div class="ranking-info">
                <div class="ranking-name">{{ item.nickname }}</div>
                <div class="ranking-desc">{{ item.phone }}</div>
              </div>
              <div class="ranking-value">
                <div class="ranking-amount">¥{{ item.earnings }}</div>
                <div class="ranking-count">{{ item.orderCount }}单</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据统计表格 -->
    <el-card shadow="never" class="mt-4">
      <template #header>
        <div class="flex-x-between">
          <div class="flex-y-center">
            <i-ep-data-line class="mr-1" />数据统计
          </div>
          <div>
            <el-date-picker
              v-model="statsDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              size="small"
              @change="loadStatsData"
            />
            <el-button type="primary" size="small" class="ml-2" @click="handleExportStats">
              <i-ep-download />导出报表
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="statsData" stripe>
        <el-table-column label="日期" prop="date" width="120" />
        <el-table-column label="订单数量" prop="orderCount" width="100" align="center" />
        <el-table-column label="订单金额" prop="orderAmount" width="120" align="right">
          <template #default="scope">
            ¥{{ scope.row.orderAmount }}
          </template>
        </el-table-column>
        <el-table-column label="充值数量" prop="rechargeCount" width="100" align="center" />
        <el-table-column label="充值金额" prop="rechargeAmount" width="120" align="right">
          <template #default="scope">
            ¥{{ scope.row.rechargeAmount }}
          </template>
        </el-table-column>
        <el-table-column label="新增会员" prop="newMembers" width="100" align="center" />
        <el-table-column label="活跃会员" prop="activeMembers" width="100" align="center" />
        <el-table-column label="活跃打手" prop="activeWorkers" width="100" align="center" />
        <el-table-column label="平台收入" prop="platformIncome" width="120" align="right">
          <template #default="scope">
            ¥{{ scope.row.platformIncome }}
          </template>
        </el-table-column>
        <el-table-column label="余额支付" prop="balancePayment" width="120" align="right">
          <template #default="scope">
            ¥{{ scope.row.balancePayment }}
          </template>
        </el-table-column>
        <el-table-column label="扫码支付" prop="scanPayment" width="120" align="right">
          <template #default="scope">
            ¥{{ scope.row.scanPayment }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import ReportAPI, { type DashboardStats, type TrendData, type PayMethodStats, type MemberRanking, type WorkerRanking, type DetailStats } from '@/api/report'

defineOptions({
  name: 'Report',
  inheritAttrs: false
})

// 响应式数据
const trendChartRef = ref()
const paymentChartRef = ref()
const trendType = ref('order')
const trendPeriod = ref('7')
const memberRankingPeriod = ref('today')
const workerRankingPeriod = ref('today')
const statsDateRange = ref([])
const memberRanking = ref([])
const workerRanking = ref([])
const statsData = ref([])

// 图表实例
let trendChart: echarts.ECharts | null = null
let paymentChart: echarts.ECharts | null = null

// 当前日期
const currentDate = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
})

// 今日概览数据
const todayOverview = reactive({
  orderCount: 0,
  orderAmount: 0,
  rechargeCount: 0,
  rechargeAmount: 0,
  newMembers: 0,
  totalMembers: 0,
  activeWorkers: 0,
  totalWorkers: 0,
  totalIncome: 0,
  incomeChange: 0,
  platformBalance: 0
})

// 排行榜类型
const getRankingType = (index: number) => {
  const types = ['danger', 'warning', 'success']
  return types[index] || 'info'
}

// 加载今日概览
const loadTodayOverview = async () => {
  try {
    const data = await ReportAPI.getDashboardStats()
    console.log('今日概览数据:', data)
    Object.assign(todayOverview, {
      orderCount: data.todayOrders || 0,
      orderAmount: 0, // 需要从趋势数据获取
      rechargeCount: data.todayRecharge || 0,
      rechargeAmount: 0, // 需要从趋势数据获取
      newMembers: data.todayMembers || 0,
      totalMembers: 0, // 需要从其他API获取
      activeWorkers: data.todayWorkers || 0,
      totalWorkers: 0, // 需要从其他API获取
      totalIncome: data.todayIncome || 0,
      incomeChange: 0, // 需要计算
      platformBalance: data.platformBalance || 0
    })
  } catch (error) {
    console.error('获取今日概览失败:', error)
    ElMessage.error('获取今日概览失败')
  }
}

// 加载趋势数据
const loadTrendData = async () => {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - parseInt(trendPeriod.value))
    
    const data = await ReportAPI.getTrendData({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    })
    
    console.log('趋势数据:', data)
    
    const dates = data.map(item => {
       const date = new Date(item.date)
       return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
     })
     const values = data.map(item => 
       trendType.value === 'order' ? item.orderCount : item.rechargeAmount
     )
     
     nextTick(() => {
    if (trendChart) {
      trendChart.setOption({
        title: {
          text: trendType.value === 'order' ? '订单趋势' : '充值趋势',
          left: 'center',
          textStyle: { fontSize: 14 }
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            const data = params[0]
            return `${data.name}<br/>${data.seriesName}: ${trendType.value === 'order' ? data.value + '单' : '¥' + data.value}`
          }
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: { fontSize: 12 }
        },
        yAxis: {
          type: 'value',
          axisLabel: { fontSize: 12 }
        },
        series: [{
          name: trendType.value === 'order' ? '订单数量' : '充值金额',
          type: 'line',
          data: values,
          smooth: true,
          itemStyle: { color: '#409EFF' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
              ]
            }
          }
        }],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        }
      })
    }
  })
  } catch (error) {
    console.error('获取支付方式分布失败:', error)
    ElMessage.error('获取支付方式分布失败')
  }
}

// 加载支付方式分布
const loadPaymentDistribution = async () => {
  try {
    const { data } = await ReportAPI.getPayMethodStats({})
    const chartData = data.map(item => ({
       value: item.percentage,
       name: item.method === 'balance' ? '余额支付' : 
             item.method === 'qrcode' ? '扫码支付' : '混合支付'
     }))
     
     nextTick(() => {
    if (paymentChart) {
      paymentChart.setOption({
        title: {
          text: '支付方式',
          left: 'center',
          top: 'bottom',
          textStyle: { fontSize: 14 }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c}% ({d}%)'
        },
        series: [{
          name: '支付方式',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          data: chartData,
          itemStyle: {
            borderRadius: 5,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      })
    }
  })
}

// 加载会员排行榜
const loadMemberRanking = async () => {
  try {
    const period = memberRankingPeriod.value
    const endDate = new Date()
    const startDate = new Date()
    
    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0)
    } else if (period === 'week') {
      startDate.setDate(endDate.getDate() - 7)
    } else if (period === 'month') {
      startDate.setMonth(endDate.getMonth() - 1)
    }
    
    const { data } = await ReportAPI.getMemberRanking({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      limit: 10
    })
    
    memberRanking.value = data.map(item => ({
      id: item.memberId,
      nickname: item.memberNickname,
      phone: item.memberUsername,
      avatar: '',
      amount: item.totalConsume,
      orderCount: item.orderCount
    }))
  } catch (error) {
    console.error('获取会员排行榜失败:', error)
    ElMessage.error('获取会员排行榜失败')
  }
}

// 加载打手排行榜
const loadWorkerRanking = async () => {
  try {
    const period = workerRankingPeriod.value
    const endDate = new Date()
    const startDate = new Date()
    
    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0)
    } else if (period === 'week') {
      startDate.setDate(endDate.getDate() - 7)
    } else if (period === 'month') {
      startDate.setMonth(endDate.getMonth() - 1)
    }
    
    const { data } = await ReportAPI.getWorkerRanking({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      limit: 10
    })
    
    workerRanking.value = data.map(item => ({
      id: item.workerId,
      nickname: item.workerNickname,
      phone: item.workerUsername,
      avatar: '',
      earnings: item.totalIncome,
      orderCount: item.orderCount
    }))
  } catch (error) {
    console.error('获取打手排行榜失败:', error)
    ElMessage.error('获取打手排行榜失败')
  }
}

// 加载统计数据
const loadStatsData = async () => {
  try {
    let startDate = ''
    let endDate = ''
    
    if (statsDateRange.value && statsDateRange.value.length === 2) {
      startDate = statsDateRange.value[0]
      endDate = statsDateRange.value[1]
    } else {
      // 默认查询最近7天
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 7)
      startDate = start.toISOString().split('T')[0]
      endDate = end.toISOString().split('T')[0]
    }
    
    const { data } = await ReportAPI.getDetailStats({
      startDate,
      endDate
    })
    
    statsData.value = data.list.map(item => ({
      date: item.date,
      orderCount: item.orderCount,
      orderAmount: item.orderAmount,
      rechargeCount: item.rechargeCount,
      rechargeAmount: item.rechargeAmount,
      newMembers: item.newMembers,
      activeMembers: 0, // 需要从其他API获取
      activeWorkers: item.newWorkers,
      platformIncome: item.platformIncome,
      balancePayment: item.balancePayAmount,
      scanPayment: item.qrcodePayAmount
    }))
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  }
}

// 导出统计报表
const handleExportStats = async () => {
  try {
    let startDate = ''
    let endDate = ''
    
    if (statsDateRange.value && statsDateRange.value.length === 2) {
      startDate = statsDateRange.value[0]
      endDate = statsDateRange.value[1]
    } else {
      // 默认导出最近7天
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 7)
      startDate = start.toISOString().split('T')[0]
      endDate = end.toISOString().split('T')[0]
    }
    
    await ReportAPI.exportReport({
      type: 'detail',
      startDate,
      endDate
    })
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    if (trendChartRef.value) {
      trendChart = echarts.init(trendChartRef.value)
      loadTrendData()
    }
    
    if (paymentChartRef.value) {
      paymentChart = echarts.init(paymentChartRef.value)
      loadPaymentDistribution()
    }
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      trendChart?.resize()
      paymentChart?.resize()
    })
  })
}

// 初始化
onMounted(async () => {
  await loadTodayOverview()
  await loadMemberRanking()
  await loadWorkerRanking()
  await loadStatsData()
  initCharts()
})
</script>

<style lang="scss" scoped>
.overview-card {
  .overview-item {
    display: flex;
    align-items: center;
    padding: 16px;
    
    .overview-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-right: 16px;
    }
    
    .overview-content {
      flex: 1;
      
      .overview-title {
        font-size: 14px;
        color: #666;
        margin-bottom: 4px;
      }
      
      .overview-value {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 4px;
      }
      
      .overview-desc {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.chart-card {
  height: 380px;
}

.ranking-list {
  .ranking-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .ranking-number {
      width: 30px;
      text-align: center;
      margin-right: 12px;
    }
    
    .ranking-avatar {
      margin-right: 12px;
    }
    
    .ranking-info {
      flex: 1;
      
      .ranking-name {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 2px;
      }
      
      .ranking-desc {
        font-size: 12px;
        color: #999;
      }
    }
    
    .ranking-value {
      text-align: right;
      
      .ranking-amount {
        font-size: 14px;
        font-weight: 500;
        color: #f56c6c;
        margin-bottom: 2px;
      }
      
      .ranking-count {
        font-size: 12px;
        color: #999;
      }
    }
  }
}
</style>