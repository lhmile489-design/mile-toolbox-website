import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 主题（中性蓝灰，主色可在 styles/theme.css 一键替换；必须在 element-plus 之后覆盖）
import './styles/theme.css'

// 内置 mock：默认开启（VITE_USE_MOCK !== 'false'），开箱即跑、不依赖后端
import { setupMock } from './mock'
setupMock()

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 注册所有 Element Plus 图标为全局组件（模板内任意 <el-icon><Xxx/></el-icon> 可用）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
