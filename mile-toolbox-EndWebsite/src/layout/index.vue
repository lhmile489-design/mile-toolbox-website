<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAdminStore } from '@/stores/admin'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

// 菜单项（图标取自 Element Plus，已全局注册）
const menus = [
  { path: '/dashboard', title: '概览', icon: 'Odometer' },
  { path: '/tool', title: '工具管理', icon: 'Operation' },
  { path: '/playground', title: '工具试用台', icon: 'MagicStick' },
  { path: '/category', title: '分类管理', icon: 'Grid' },
  { path: '/user', title: '用户管理', icon: 'UserFilled' },
  { path: '/file-task', title: '文件任务监控', icon: 'Document' },
]

const activeMenu = computed(() => route.path)
const nickname = computed(() => adminStore.info?.nickname || adminStore.info?.username || '管理员')

async function handleLogout() {
  await ElMessageBox.confirm('确定退出登录？', '提示', { type: 'warning' })
  await adminStore.logout()
  ElMessage.success('已退出')
  router.replace('/login')
}
</script>

<template>
  <el-container class="layout">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <img class="logo-badge" src="/appIcon.png" alt="logo" />
        <span class="logo-text">米乐工具箱</span>
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

/* 侧边栏：浅色 + 品牌点缀 */
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
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 8px 24px -8px rgba(242, 116, 28, 0.4);
}
.logo-text {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 16px;
  color: var(--brand-text);
  letter-spacing: -0.02em;
}
.menu {
  border-right: none;
  flex: 1;
  padding: 10px 10px;
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

/* 顶栏 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--brand-surface);
  border-bottom: 1px solid var(--brand-border);
}
.title {
  font-family: var(--font-mono);
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

/* 内容区 */
.main {
  background: var(--brand-bg);
  padding: 16px;
}
</style>
