<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  categoryCreate,
  categoryDelete,
  categoryList,
  categoryUpdate,
} from '@/api/admin'
import type { ToolCategory } from '@/api/types'

const loading = ref(false)
const tableData = ref<ToolCategory[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增分类')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const defaultForm = (): Partial<ToolCategory> => ({
  code: '',
  name: '',
  icon: '',
  sort: 0,
  status: 0,
})
const form = reactive<Partial<ToolCategory>>(defaultForm())
const rules: FormRules = {
  code: [{ required: true, message: '请输入分类编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

async function loadData() {
  loading.value = true
  try {
    tableData.value = await categoryList()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  dialogTitle.value = '新增分类'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

function openEdit(row: ToolCategory) {
  dialogTitle.value = '编辑分类'
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
        await categoryUpdate(form)
        ElMessage.success('更新成功')
      } else {
        await categoryCreate(form)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      loadData()
    } finally {
      submitting.value = false
    }
  })
}

async function onDelete(row: ToolCategory) {
  await ElMessageBox.confirm(`确定删除分类「${row.name}」？`, '提示', { type: 'warning' })
  await categoryDelete(row.id)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <div class="bar">
      <el-button type="success" @click="openCreate">新增分类</el-button>
    </div>
    <el-table v-loading="loading" :data="tableData" stripe border>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="名称" min-width="140" />
      <el-table-column prop="code" label="编码" min-width="140" />
      <el-table-column prop="icon" label="图标" width="120" />
      <el-table-column prop="sort" label="排序" width="90" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'success' : 'info'" size="small">
            {{ row.status === 0 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="form.code" placeholder="如 query" />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="启用" :value="0" />
            <el-option label="停用" :value="1" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.bar {
  margin-bottom: 12px;
}
</style>
