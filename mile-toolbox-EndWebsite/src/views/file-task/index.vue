<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { fileTaskPage, fileTaskStats } from '@/api/admin'
import type { FileTask, FileTaskStats } from '@/api/types'

const loading = ref(false)
const tableData = ref<FileTask[]>([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, toolKey: '', status: undefined as number | undefined, keyword: '' })

const stats = ref<FileTaskStats>({ total: 0, successCount: 0, failCount: 0, todayCount: 0 })

// 后端文件工具集合（与后端 @TrackFileTask 注解一一对应）
const toolKeyOptions = [
  { value: 'pdf-merge', label: 'PDF 合并' },
  { value: 'pdf-split', label: 'PDF 拆分' },
  { value: 'pdf-watermark', label: 'PDF 水印' },
  { value: 'pdf-encrypt', label: 'PDF 加密' },
  { value: 'pdf-image', label: 'PDF↔图片' },
  { value: 'image-convert', label: '图片格式转换' },
  { value: 'doc-convert', label: '文档转换' },
]

const successRate = computed(() => {
  if (stats.value.total === 0) return '—'
  return ((stats.value.successCount / stats.value.total) * 100).toFixed(1) + '%'
})

// 详情弹窗
const detailVisible = ref(false)
const detailRow = ref<FileTask | null>(null)

function formatSize(bytes: number): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

function toolLabel(key: string): string {
  return toolKeyOptions.find((o) => o.value === key)?.label || key
}

async function loadData() {
  loading.value = true
  try {
    const res = await fileTaskPage({
      page: query.page,
      size: query.size,
      toolKey: query.toolKey || undefined,
      status: query.status,
      keyword: query.keyword || undefined,
    })
    tableData.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  stats.value = await fileTaskStats()
}

function onSearch() {
  query.page = 1
  loadData()
}

function onReset() {
  query.toolKey = ''
  query.status = undefined
  query.keyword = ''
  query.page = 1
  loadData()
}

function onRefresh() {
  loadData()
  loadStats()
}

function showDetail(row: FileTask) {
  detailRow.value = row
  detailVisible.value = true
}

onMounted(() => {
  loadData()
  loadStats()
})
</script>

<template>
  <div class="file-task">
    <!-- 概览卡片 -->
    <div class="stat-cards">
      <el-card shadow="never" class="stat-card">
        <div class="stat-label">任务总数</div>
        <div class="stat-value">{{ stats.total }}</div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-label">成功</div>
        <div class="stat-value ok">{{ stats.successCount }}</div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-label">失败</div>
        <div class="stat-value fail">{{ stats.failCount }}</div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-label">今日任务</div>
        <div class="stat-value">{{ stats.todayCount }}</div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-label">成功率</div>
        <div class="stat-value">{{ successRate }}</div>
      </el-card>
    </div>

    <el-card shadow="never">
      <el-form :inline="true" class="bar">
        <el-form-item label="工具">
          <el-select v-model="query.toolKey" placeholder="全部工具" clearable style="width: 160px">
            <el-option v-for="o in toolKeyOptions" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="成功" :value="0" />
            <el-option label="失败" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" placeholder="文件名/IP" clearable style="width: 180px"
            @keyup.enter="onSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
          <el-button @click="onRefresh">刷新</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="工具" width="130">
          <template #default="{ row }">{{ toolLabel(row.toolKey) }}</template>
        </el-table-column>
        <el-table-column prop="fileName" label="文件" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ row.fileName || '—' }}</template>
        </el-table-column>
        <el-table-column label="大小" width="100">
          <template #default="{ row }">{{ formatSize(row.fileSize) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'" size="small">
              {{ row.status === 0 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="耗时" width="100">
          <template #default="{ row }">{{ row.costMs }} ms</template>
        </el-table-column>
        <el-table-column prop="userId" label="用户" width="90">
          <template #default="{ row }">{{ row.userId ?? '游客' }}</template>
        </el-table-column>
        <el-table-column prop="clientIp" label="IP" width="130" show-overflow-tooltip />
        <el-table-column prop="createTime" label="时间" width="170" show-overflow-tooltip />
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination class="pager" background layout="total, prev, pager, next" :total="total"
        :current-page="query.page" :page-size="query.size"
        @current-change="(p: number) => { query.page = p; loadData() }" />
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="任务详情" width="520px">
      <el-descriptions v-if="detailRow" :column="1" border>
        <el-descriptions-item label="任务ID">{{ detailRow.id }}</el-descriptions-item>
        <el-descriptions-item label="工具">{{ toolLabel(detailRow.toolKey) }}（{{ detailRow.toolKey }}）</el-descriptions-item>
        <el-descriptions-item label="文件名">{{ detailRow.fileName || '—' }}</el-descriptions-item>
        <el-descriptions-item label="文件数量">{{ detailRow.fileCount }}</el-descriptions-item>
        <el-descriptions-item label="文件大小">{{ formatSize(detailRow.fileSize) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailRow.status === 0 ? 'success' : 'danger'" size="small">
            {{ detailRow.status === 0 ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="耗时">{{ detailRow.costMs }} ms</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detailRow.userId ?? '游客' }}</el-descriptions-item>
        <el-descriptions-item label="客户端IP">{{ detailRow.clientIp || '—' }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ detailRow.createTime || '—' }}</el-descriptions-item>
        <el-descriptions-item v-if="detailRow.status === 1" label="失败原因">
          <span class="err-msg">{{ detailRow.errorMsg || '处理失败' }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<style scoped>
.stat-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.stat-card {
  text-align: center;
}
.stat-label {
  color: var(--brand-text-muted);
  font-size: 13px;
  margin-bottom: 8px;
}
.stat-value {
  font-family: var(--font-mono);
  font-size: 26px;
  font-weight: 700;
  color: var(--brand-text);
}
.stat-value.ok {
  color: #16a34a;
}
.stat-value.fail {
  color: #dc2626;
}
.bar {
  margin-bottom: 8px;
}
.pager {
  margin-top: 16px;
  justify-content: flex-end;
}
.err-msg {
  color: #dc2626;
  word-break: break-all;
}
</style>
