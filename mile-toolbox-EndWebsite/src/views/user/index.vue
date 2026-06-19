<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { userChangeStatus, userPage } from '@/api/admin'
import type { ToolUser } from '@/api/types'

interface UserRow extends ToolUser {
  status?: number
}

const loading = ref(false)
const tableData = ref<UserRow[]>([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, keyword: '' })

async function loadData() {
  loading.value = true
  try {
    const res = await userPage({
      page: query.page,
      size: query.size,
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

async function onToggleStatus(row: UserRow) {
  const next = (row.status ?? 0) === 0 ? 1 : 0
  await userChangeStatus(row.id, next)
  row.status = next
  ElMessage.success(next === 0 ? '已启用' : '已禁用')
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <el-form :inline="true" class="bar">
      <el-form-item label="关键词">
        <el-input v-model="query.keyword" placeholder="用户名/昵称" clearable style="width: 200px"
          @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableData" stripe border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" min-width="140" show-overflow-tooltip />
      <el-table-column prop="nickname" label="昵称" min-width="140" show-overflow-tooltip />
      <el-table-column prop="email" label="邮箱" min-width="160" show-overflow-tooltip />
      <el-table-column prop="phone" label="手机号" width="140" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-switch :model-value="(row.status ?? 0) === 0" @change="onToggleStatus(row)" />
        </template>
      </el-table-column>
    </el-table>

    <el-pagination class="pager" background layout="total, prev, pager, next" :total="total"
      :current-page="query.page" :page-size="query.size"
      @current-change="(p: number) => { query.page = p; loadData() }" />
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
