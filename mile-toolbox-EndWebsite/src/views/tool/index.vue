<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  categoryList,
  toolChangeStatus,
  toolCreate,
  toolDelete,
  toolPage,
  toolUpdate,
} from '@/api/admin'
import type { Tool, ToolCategory } from '@/api/types'

const loading = ref(false)
const tableData = ref<Tool[]>([])
const total = ref(0)
const categories = ref<ToolCategory[]>([])

const query = reactive({
  page: 1,
  size: 10,
  categoryId: undefined as number | undefined,
  keyword: '',
})

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新增工具')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const defaultForm = (): Partial<Tool> => ({
  toolKey: '',
  name: '',
  categoryId: undefined,
  description: '',
  icon: '',
  handleType: 0,
  routePath: '',
  sort: 0,
  status: 0,
})
const form = reactive<Partial<Tool>>(defaultForm())

const rules: FormRules = {
  toolKey: [{ required: true, message: '请输入工具标识', trigger: 'blur' }],
  name: [{ required: true, message: '请输入工具名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
}

function categoryName(id: number) {
  return categories.value.find((c) => c.id === id)?.name || id
}

async function loadCategories() {
  categories.value = await categoryList()
}

async function loadData() {
  loading.value = true
  try {
    const res = await toolPage({
      page: query.page,
      size: query.size,
      categoryId: query.categoryId,
      keyword: query.keyword || undefined,
    })
    tableData.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function onSearch() {
  query.page = 1
  loadData()
}

function onReset() {
  query.categoryId = undefined
  query.keyword = ''
  query.page = 1
  loadData()
}

function openCreate() {
  dialogTitle.value = '新增工具'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

function openEdit(row: Tool) {
  dialogTitle.value = '编辑工具'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (form.id) {
        await toolUpdate(form)
        ElMessage.success('更新成功')
      } else {
        await toolCreate(form)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      loadData()
    } finally {
      submitting.value = false
    }
  })
}

async function onToggleStatus(row: Tool) {
  const next = row.status === 0 ? 1 : 0
  await toolChangeStatus(row.id, next)
  row.status = next
  ElMessage.success(next === 0 ? '已上架' : '已下架')
}

async function onDelete(row: Tool) {
  await ElMessageBox.confirm(`确定删除工具「${row.name}」？`, '提示', { type: 'warning' })
  await toolDelete(row.id)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(() => {
  loadCategories()
  loadData()
})
</script>

<template>
  <div>
    <el-card shadow="never">
      <!-- 搜索栏 -->
      <el-form :inline="true" class="search-bar">
        <el-form-item label="分类">
          <el-select v-model="query.categoryId" placeholder="全部分类" clearable style="width: 160px">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" placeholder="名称/标识/描述" clearable style="width: 200px"
            @keyup.enter="onSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
          <el-button type="success" @click="openCreate">新增工具</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="名称" min-width="130" show-overflow-tooltip />
        <el-table-column prop="toolKey" label="标识" min-width="130" show-overflow-tooltip />
        <el-table-column label="分类" width="110">
          <template #default="{ row }">{{ categoryName(row.categoryId) }}</template>
        </el-table-column>
        <el-table-column label="处理位置" width="100">
          <template #default="{ row }">
            <el-tag :type="row.handleType === 1 ? 'warning' : 'info'" size="small">
              {{ row.handleType === 1 ? '后端' : '前端' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="useCount" label="使用次数" width="100" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch :model-value="row.status === 0" @change="onToggleStatus(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination class="pager" background layout="total, sizes, prev, pager, next" :total="total"
        :current-page="query.page" :page-size="query.size" :page-sizes="[10, 20, 50]"
        @current-change="(p: number) => { query.page = p; loadData() }"
        @size-change="(s: number) => { query.size = s; query.page = 1; loadData() }" />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="工具标识" prop="toolKey">
              <el-input v-model="form.toolKey" placeholder="如 pdf-merge" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工具名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属分类" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="选择分类" style="width: 100%">
                <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="处理位置">
              <el-select v-model="form.handleType" style="width: 100%">
                <el-option label="前端处理" :value="0" />
                <el-option label="后端处理" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="路由路径">
              <el-input v-model="form.routePath" placeholder="如 /tool/pdf-merge" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="图标">
              <el-input v-model="form.icon" placeholder="图标标识" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model="form.sort" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="上架" :value="0" />
                <el-option label="下架" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述">
              <el-input v-model="form.description" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.search-bar {
  margin-bottom: 8px;
}
.pager {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
