<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <div class="flex-x-between">
        <div>
          <el-input v-model="query.keyword" placeholder="搜索商品名称" style="width: 220px" clearable @keyup.enter.native="loadData" />
          <el-button class="ml-2" type="primary" @click="loadData">搜索</el-button>
        </div>
        <div>
          <el-button type="primary" @click="openDialog()">新增商品</el-button>
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-table :data="list" stripe>
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="名称" prop="name" min-width="160" />
        <el-table-column label="价格" width="140">
          <template #default="scope">¥{{ Number(scope.row.price).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="分成比例" width="140">
          <template #default="scope">{{ (Number(scope.row.commission_rate) * 100).toFixed(2) }}%</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">{{ scope.row.status === 'active' ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="scope">
            <el-button type="primary" link @click="openDialog(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDisable(scope.row)">停用</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-model:total="total" v-model:page="query.page" v-model:limit="query.limit" @pagination="loadData" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="商品名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="商品价格" prop="price"><el-input-number v-model="form.price" :min="0" :precision="2" :step="1" style="width: 100%" /></el-form-item>
        <el-form-item label="分成比例" prop="commission_rate"><el-input-number v-model="form.commission_rate" :min="0" :max="1" :step="0.01" style="width: 100%" /></el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible=false">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import ProductAPI, { type ProductForm, type ProductVO } from '@/api/product'

const query = reactive({ page: 1, limit: 10, keyword: '' })
const list = ref<ProductVO[]>([])
const total = ref(0)

const dialog = reactive({ visible: false, title: '新增商品' })
const formRef = ref()
const form = reactive<ProductForm>({ name: '', price: 0, commission_rate: 0 })

const rules = reactive({
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  commission_rate: [{ required: true, message: '请输入分成比例(0-1)', trigger: 'blur' }]
})

async function loadData() {
  const data = await ProductAPI.getPage(query)
  list.value = data.list
  total.value = data.total
}

function openDialog(row?: ProductVO) {
  dialog.visible = true
  if (row) {
    dialog.title = '编辑商品'
    Object.assign(form, { id: row.id, name: row.name, price: Number(row.price), commission_rate: Number(row.commission_rate) })
  } else {
    dialog.title = '新增商品'
    Object.assign(form, { id: undefined, name: '', price: 0, commission_rate: 0 })
  }
}

function handleSubmit() {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return
    const action = form.id ? ProductAPI.update(form.id, form) : ProductAPI.create(form)
    action.then(() => { ElMessage.success('保存成功'); dialog.visible = false; loadData() })
  })
}

function handleDisable(row: ProductVO) {
  ElMessageBox.confirm('确认停用该商品？', '提示', { type: 'warning' }).then(() => {
    ProductAPI.delete(row.id as number).then(() => { ElMessage.success('已停用'); loadData() })
  })
}

onMounted(loadData)
</script>

<style scoped>
.dialog-footer{ text-align:right }
.kpi-item{ padding:8px 0 }
</style>


