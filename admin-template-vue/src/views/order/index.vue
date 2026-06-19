<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { orderPage } from '@/api/order'
import type { OrderRow } from '@/api/types'

const loading = ref(false)
const tableData = ref<OrderRow[]>([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, keyword: '', status: '' })

const statusOptions = [
  { value: 'pending', label: '待付款', tag: 'info' },
  { value: 'paid', label: '已付款', tag: 'warning' },
  { value: 'shipped', label: '已发货', tag: 'primary' },
  { value: 'done', label: '已完成', tag: 'success' },
  { value: 'canceled', label: '已取消', tag: 'danger' },
] as const

function statusMeta(s: string) {
  return statusOptions.find((o) => o.value === s)
}

async function loadData() {
  loading.value = true
  try {
    const res = await orderPage({
      page: query.page,
      size: query.size,
      keyword: query.keyword || undefined,
      status: query.status || undefined,
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
  query.status = ''
  query.page = 1
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
          placeholder="订单号/客户"
          clearable
          style="width: 200px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 130px">
          <el-option v-for="o in statusOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableData" stripe border>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="orderNo" label="订单号" min-width="160" show-overflow-tooltip />
      <el-table-column prop="customer" label="客户" min-width="140" show-overflow-tooltip />
      <el-table-column label="金额" width="130" align="right">
        <template #default="{ row }">
          <span class="brand-mono">¥{{ row.amount.toLocaleString() }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusMeta(row.status)?.tag" size="small">
            {{ statusMeta(row.status)?.label || row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" width="180" show-overflow-tooltip />
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
