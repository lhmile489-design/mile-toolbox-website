<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { getCategoryShare, getStats, getTrend } from '@/api/dashboard'
import type { DashboardStats } from '@/api/types'

const loading = ref(false)
const stats = ref<DashboardStats>({ userCount: 0, orderCount: 0, revenue: 0, todayVisits: 0 })

const cards = ref<{ label: string; key: keyof DashboardStats; color: string; prefix?: string }[]>([
  { label: '成员数', key: 'userCount', color: '#f2741c' },
  { label: '订单数', key: 'orderCount', color: '#14b8a6' },
  { label: '总营收', key: 'revenue', color: '#8b5cf6', prefix: '¥' },
  { label: '今日访问', key: 'todayVisits', color: '#ec4899' },
])

const trendEl = ref<HTMLDivElement>()
const pieEl = ref<HTMLDivElement>()
let trendChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function handleResize() {
  trendChart?.resize()
  pieChart?.resize()
}

async function renderTrend() {
  const data = await getTrend(7)
  if (!trendEl.value) return
  if (!trendChart) trendChart = echarts.init(trendEl.value)
  const brand = '#ff8c42'
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.date.slice(5)),
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
        name: '访问量',
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

async function renderPie() {
  const data = await getCategoryShare()
  if (!pieEl.value) return
  if (!pieChart) pieChart = echarts.init(pieEl.value)
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { color: '#6b5d52' } },
    color: ['#ff8c42', '#14b8a6', '#8b5cf6', '#ec4899', '#f59e0b'],
    series: [
      {
        name: '来源占比',
        type: 'pie',
        radius: ['40%', '68%'],
        center: ['50%', '46%'],
        itemStyle: { borderColor: '#fff', borderWidth: 2 },
        label: { color: '#6b5d52' },
        data,
      },
    ],
  })
}

async function load() {
  loading.value = true
  try {
    stats.value = await getStats()
    await nextTick()
    await Promise.all([renderTrend(), renderPie()])
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
  trendChart?.dispose()
  pieChart?.dispose()
  trendChart = null
  pieChart = null
})
</script>

<template>
  <div v-loading="loading">
    <el-row :gutter="16">
      <el-col v-for="c in cards" :key="c.key" :xs="12" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value brand-mono" :style="{ color: c.color }">
            {{ c.prefix || '' }}{{ stats[c.key].toLocaleString() }}
          </div>
          <div class="stat-label">{{ c.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="charts">
      <el-col :xs="24" :md="16">
        <el-card header="近 7 天访问趋势" shadow="never">
          <div ref="trendEl" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card header="访问来源占比" shadow="never">
          <div ref="pieEl" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
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
  color: var(--brand-text-muted);
  margin-top: 6px;
  font-size: 13px;
}
.charts {
  margin-top: 8px;
}
.chart {
  height: 320px;
  width: 100%;
}
</style>
