<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAdminStore } from '@/stores/admin'

const router = useRouter()
const adminStore = useAdminStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ username: 'admin', password: '' })
const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await adminStore.login(form.username, form.password)
      ElMessage.success('登录成功')
      router.replace('/dashboard')
    } finally {
      loading.value = false
    }
  })
}
</script>

<template>
  <div class="login-page">
    <!-- 左侧品牌区：banner 背景 -->
    <div class="brand-panel">
      <div class="brand-mask" />
      <div class="brand-content">
        <img class="brand-logo" src="/appIcon.png" alt="米乐工具箱" />
        <h1 class="brand-name brand-mono">米乐工具箱</h1>
        <p class="brand-slogan">一站式在线工具集 · 后台管理</p>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="form-panel">
      <el-card class="login-card">
        <div class="brand">
          <img class="brand-badge" src="/appIcon.png" alt="logo" />
          <h2 class="brand-title">欢迎登录</h2>
          <p class="brand-sub">米乐工具箱后台管理系统</p>
        </div>
        <el-form ref="formRef" :model="form" :rules="rules" size="large" @keyup.enter="onSubmit">
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="用户名" :prefix-icon="'User'" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="密码" :prefix-icon="'Lock'" show-password />
          </el-form-item>
          <el-button type="primary" class="login-btn" :loading="loading" @click="onSubmit">登 录</el-button>
        </el-form>
        <p class="tip">默认账号 admin / admin123456</p>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  overflow: hidden;
  background: var(--brand-bg);
}

/* 左侧品牌区 */
.brand-panel {
  position: relative;
  flex: 1.2;
  background: url('/banner.jpg') center / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(214, 95, 16, 0.78), rgba(255, 140, 66, 0.5));
}
.brand-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #fff;
  padding: 24px;
}
.brand-logo {
  width: 92px;
  height: 92px;
  border-radius: 22px;
  object-fit: cover;
  box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.4);
}
.brand-name {
  font-size: 32px;
  margin: 20px 0 0;
  letter-spacing: 1px;
}
.brand-slogan {
  margin: 12px 0 0;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
}

/* 右侧表单区 */
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.login-card {
  width: 360px;
  padding: 16px 12px;
  border: 1px solid var(--brand-border);
}
.brand {
  text-align: center;
  margin: 8px 0 24px;
}
.brand-badge {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  border-radius: 16px;
  object-fit: cover;
  display: block;
  box-shadow: 0 10px 28px -8px rgba(242, 116, 28, 0.45);
}
.brand-title {
  font-family: var(--font-mono);
  font-size: 22px;
  color: var(--brand-text);
  margin: 0;
}
.brand-sub {
  margin: 6px 0 0;
  color: var(--brand-text-muted);
  font-size: 13px;
}
.login-btn {
  width: 100%;
}
.tip {
  text-align: center;
  color: var(--brand-text-muted);
  font-size: 12px;
  margin-top: 16px;
}

/* 窄屏：隐藏品牌区，表单铺满 */
@media (max-width: 860px) {
  .brand-panel {
    display: none;
  }
}
</style>
