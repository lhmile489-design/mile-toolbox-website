<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { statsHotTools, statsOverview, statsUsageTrend } from '@/api/admin'
import type { StatsOverview, Tool } from '@/api/types'

const overview = ref<StatsOverview>({
  userCount: 0,
  toolCount: 0,
  categoryCount: 0,
  totalUsage: 0,
  todayUsage: 0,
})
const hotTools = ref<Tool[]>([])
const loading = ref(false)

const cards = ref<{ label: string; key: keyof StatsOverview; color: string }[]>([
  { label: '注册用户', key: 'userCount', color: '#2e90fa' },
  { label: '工具总数', key: 'toolCount', color: '#14b8a6' },
  { label: '分类总数', key: 'categoryCount', color: '#ff8c42' },
  { label: '累计使用', key: 'totalUsage', color: '#8b5cf6' },
  { label: '今日使用', key: 'todayUsage', color: '#ec4899' },
])

// ===== ECharts 使用趋势 =====
const chartEl = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function handleResize() {
  chart?.resize()
}

async function renderTrend() {
  const data = await statsUsageTrend(7)
  if (!chartEl.value) return
  if (!chart) chart = echarts.init(chartEl.value)
  const brand = '#ff8c42'
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.date.slice(5)), // MM-dd
      axisLine: { lineStyle: { color: '#e7d4c2' } },
      axisLabel: { color: '#6b5d52' },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: '#f2e6da' } },
      axisLabel: { color: '#6b5d52' },
    },
    series: [
      {
        name: '使用次数',
        type: 'line',
        smooth: true,
        data: data.map((d) => d.count),
        itemStyle: { color: brand },
        lineStyle: { color: brand, width: 2 },
        areaStyle: { color: hexToRgba(brand, 0.12) },
      },
    ],
  })
}

async function load() {
  loading.value = true
  try {
    overview.value = await statsOverview()
    hotTools.value = await statsHotTools(10)
    await nextTick()
    await renderTrend()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div v-loading="loading">
    <el-row :gutter="16">
      <el-col v-for="c in cards" :key="c.key" :xs="12" :sm="8" :md="4">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value" :style="{ color: c.color }">{{ overview[c.key] }}</div>
          <div class="stat-label">{{ c.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="trend-card" header="近 7 天使用趋势" shadow="never">
      <div ref="chartEl" class="trend-chart"></div>
    </el-card>

    <el-card class="hot-card" header="热门工具 TOP 10" shadow="never">
      <el-table :data="hotTools" stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="name" label="工具名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="toolKey" label="标识" min-width="160" show-overflow-tooltip />
        <el-table-column prop="useCount" label="使用次数" width="120" sortable />
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.stat-card {
  text-align: center;
  margin-bottom: 16px;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
}
.stat-label {
  color: #6b7280;
  margin-top: 6px;
  font-size: 13px;
}
.trend-card {
  margin-top: 8px;
  margin-bottom: 16px;
}
.trend-chart {
  height: 300px;
  width: 100%;
}
.hot-card {
  margin-top: 8px;
}
</style>
