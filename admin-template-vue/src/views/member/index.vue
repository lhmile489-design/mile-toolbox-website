<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  memberChangeStatus,
  memberCreate,
  memberDelete,
  memberPage,
  memberUpdate,
} from '@/api/member'
import type { Member } from '@/api/types'

const loading = ref(false)
const tableData = ref<Member[]>([])
const total = ref(0)
const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
  role: '' as '' | Member['role'],
  status: undefined as number | undefined,
})

const roleOptions = [
  { value: 'admin', label: '管理员', tag: 'danger' },
  { value: 'editor', label: '编辑', tag: 'warning' },
  { value: 'viewer', label: '只读', tag: 'info' },
] as const

function roleMeta(role: string) {
  return roleOptions.find((r) => r.value === role)
}

async function loadData() {
  loading.value = true
  try {
    const res = await memberPage({
      page: query.page,
      size: query.size,
      keyword: query.keyword || undefined,
      role: query.role || undefined,
      status: query.status,
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
  query.keyword = ''
  query.role = ''
  query.status = undefined
  query.page = 1
  loadData()
}

// ===== 新增/编辑弹窗 =====
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()
const form = reactive<Partial<Member>>({
  id: undefined,
  name: '',
  email: '',
  role: 'viewer',
  status: 0,
})
const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

function openCreate() {
  dialogMode.value = 'create'
  Object.assign(form, { id: undefined, name: '', email: '', role: 'viewer', status: 0 })
  dialogVisible.value = true
}
function openEdit(row: Member) {
  dialogMode.value = 'edit'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (dialogMode.value === 'create') {
      await memberCreate({ ...form })
      ElMessage.success('已新增')
    } else {
      await memberUpdate({ ...form })
      ElMessage.success('已保存')
    }
    dialogVisible.value = false
    loadData()
  })
}

async function onToggleStatus(row: Member) {
  const next = row.status === 0 ? 1 : 0
  await memberChangeStatus(row.id, next)
  row.status = next as 0 | 1
  ElMessage.success(next === 0 ? '已启用' : '已禁用')
}

async function onDelete(row: Member) {
  await ElMessageBox.confirm(`确定删除成员「${row.name}」？`, '提示', { type: 'warning' })
  await memberDelete(row.id)
  ElMessage.success('已删除')
  loadData()
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <el-form :inline="true" class="bar">
      <el-form-item label="关键词">
        <el-input
          v-model="query.keyword"
          placeholder="姓名/邮箱"
          clearable
          style="width: 180px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="query.role" placeholder="全部角色" clearable style="width: 130px">
          <el-option v-for="r in roleOptions" :key="r.value" :label="r.label" :value="r.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 120px">
          <el-option label="正常" :value="0" />
          <el-option label="禁用" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button @click="onReset">重置</el-button>
        <el-button type="primary" plain :icon="'Plus'" @click="openCreate">新增成员</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableData" stripe border>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="姓名" min-width="120" show-overflow-tooltip />
      <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
      <el-table-column label="角色" width="110">
        <template #default="{ row }">
          <el-tag :type="roleMeta(row.role)?.tag" size="small">
            {{ roleMeta(row.role)?.label || row.role }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-switch :model-value="row.status === 0" @change="onToggleStatus(row)" />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" show-overflow-tooltip />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pager"
      background
      layout="total, prev, pager, next"
      :total="total"
      :current-page="query.page"
      :page-size="query.size"
      @current-change="(p: number) => { query.page = p; loadData() }"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增成员' : '编辑成员'"
      width="460px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="72px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r.value" :label="r.label" :value="r.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.bar {
  margin-bottom: 8px;
}
.pager {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
