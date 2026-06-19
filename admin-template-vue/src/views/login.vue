<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ username: 'admin', password: 'admin123' })
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
      await auth.login(form.username, form.password)
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
    <!-- 左侧品牌区（纯 CSS 渐变，无外部图片依赖） -->
    <div class="brand-panel">
      <div class="brand-content">
        <div class="brand-logo brand-mono">A</div>
        <h1 class="brand-name">Admin Template</h1>
        <p class="brand-slogan">通用后台管理系统模板 · Vue 3 + Element Plus</p>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="form-panel">
      <el-card class="login-card">
        <div class="brand">
          <h2 class="brand-title">欢迎登录</h2>
          <p class="brand-sub">后台管理系统</p>
        </div>
        <el-form ref="formRef" :model="form" :rules="rules" size="large" @keyup.enter="onSubmit">
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="用户名" :prefix-icon="'User'" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              :prefix-icon="'Lock'"
              show-password
            />
          </el-form-item>
          <el-button type="primary" class="login-btn" :loading="loading" @click="onSubmit">
            登 录
          </el-button>
        </el-form>
        <p class="tip">演示账号 admin / admin123</p>
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
.brand-panel {
  position: relative;
  flex: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--brand-primary-700), var(--brand-primary-400));
}
.brand-content {
  text-align: center;
  color: #fff;
  padding: 24px;
}
.brand-logo {
  display: grid;
  place-items: center;
  width: 84px;
  height: 84px;
  margin: 0 auto;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  font-size: 44px;
  font-weight: 700;
}
.brand-name {
  font-size: 30px;
  margin: 20px 0 0;
  letter-spacing: 1px;
}
.brand-slogan {
  margin: 12px 0 0;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
}
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
.brand-title {
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
@media (max-width: 860px) {
  .brand-panel {
    display: none;
  }
}
</style>
