<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

/** 菜单由路由驱动：取根布局 children 中带 meta.title 的路由 */
const menus = computed(() => {
  const root = router.options.routes.find((r) => r.path === '/')
  return (root?.children ?? [])
    .filter((c) => c.meta?.title)
    .map((c) => ({
      path: '/' + c.path,
      title: c.meta!.title as string,
      icon: (c.meta!.icon as string) || 'Menu',
    }))
})

const activeMenu = computed(() => route.path)
const nickname = computed(() => auth.info?.nickname || auth.info?.username || '管理员')

async function handleLogout() {
  await ElMessageBox.confirm('确定退出登录？', '提示', { type: 'warning' })
  await auth.logout()
  ElMessage.success('已退出')
  router.replace('/login')
}

onMounted(() => {
  // 刷新后若无用户信息则拉取（mock 下也可用）
  if (!auth.info) auth.fetchInfo().catch(() => {})
})
</script>

<template>
  <el-container class="layout">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <span class="logo-badge brand-mono">A</span>
        <span class="logo-text">Admin Template</span>
      </div>
      <el-menu :default-active="activeMenu" router class="menu">
        <el-menu-item v-for="m in menus" :key="m.path" :index="m.path">
          <el-icon><component :is="m.icon" /></el-icon>
          <span>{{ m.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="title">{{ route.meta.title || '' }}</div>
        <el-dropdown @command="handleLogout">
          <span class="user">
            <span class="avatar">{{ nickname.charAt(0) }}</span>
            <span class="name">{{ nickname }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <el-icon><SwitchButton /></el-icon> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100vh;
}
.aside {
  background: var(--brand-surface);
  border-right: 1px solid var(--brand-border);
  display: flex;
  flex-direction: column;
}
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  border-bottom: 1px solid var(--brand-border);
}
.logo-badge {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--brand-primary);
  color: #fff;
  font-weight: 700;
  font-size: 18px;
}
.logo-text {
  font-weight: 700;
  font-size: 16px;
  color: var(--brand-text);
  letter-spacing: -0.02em;
}
.menu {
  border-right: none;
  flex: 1;
  padding: 10px;
  background: transparent;
}
.menu :deep(.el-menu-item) {
  border-radius: 10px;
  margin-bottom: 4px;
  height: 46px;
  color: var(--brand-text-soft);
}
.menu :deep(.el-menu-item:hover) {
  background: var(--brand-primary-soft);
  color: var(--brand-primary-700);
}
.menu :deep(.el-menu-item.is-active) {
  background: var(--brand-primary);
  color: #fff;
  font-weight: 600;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--brand-surface);
  border-bottom: 1px solid var(--brand-border);
}
.title {
  font-size: 16px;
  font-weight: 700;
  color: var(--brand-text);
}
.user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--brand-text);
  outline: none;
}
.avatar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--brand-primary-soft);
  color: var(--brand-primary-700);
  font-weight: 700;
}
.name {
  font-size: 14px;
}
.main {
  background: var(--brand-bg);
  padding: 16px;
}
</style>
