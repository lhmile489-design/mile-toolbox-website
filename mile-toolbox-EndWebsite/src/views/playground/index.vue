<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadUserFile } from 'element-plus'
import {
  fileProcess,
  geocodeForward,
  geocodeReverse,
  ipLocation,
  phoneLocation,
  zipcode,
} from '@/api/playground'

/** 当前选中的工具分组 */
const activeTab = ref('query')

// ===== 查询类 =====
const queryResult = ref<unknown>(null)
const queryLoading = ref(false)
const q = reactive({
  tool: 'ip-location',
  ip: '',
  phone: '',
  zip: '',
  address: '',
  city: '',
  lng: '' as string | number,
  lat: '' as string | number,
})

async function runQuery() {
  queryLoading.value = true
  queryResult.value = null
  try {
    let data: unknown
    if (q.tool === 'ip-location') data = await ipLocation(q.ip || undefined)
    else if (q.tool === 'phone-location') data = await phoneLocation(q.phone)
    else if (q.tool === 'zipcode') data = await zipcode(q.zip)
    else if (q.tool === 'geocode-forward') data = await geocodeForward(q.address, q.city || undefined)
    else if (q.tool === 'geocode-reverse') data = await geocodeReverse(Number(q.lng), Number(q.lat))
    queryResult.value = data
    ElMessage.success('查询成功')
  } finally {
    queryLoading.value = false
  }
}

// ===== 文件类 =====
const fileLoading = ref(false)
const f = reactive({
  tool: 'pdf-merge',
  files: [] as UploadUserFile[],
  range: '1-3,5',
  text: 'CONFIDENTIAL',
  password: '123456',
  format: 'md',
  imgFormat: 'png',
  dpi: 150,
})

interface FileToolMeta {
  url: string
  multi: boolean
  accept: string
  extra?: string
}
const fileToolMeta: Record<string, FileToolMeta> = {
  'pdf-merge': { url: '/pdf/merge', multi: true, accept: '.pdf' },
  'pdf-split': { url: '/pdf/split', multi: false, accept: '.pdf', extra: 'range' },
  'pdf-watermark': { url: '/pdf/watermark', multi: false, accept: '.pdf', extra: 'text' },
  'pdf-encrypt': { url: '/pdf/encrypt', multi: false, accept: '.pdf', extra: 'password' },
  'pdf-to-image': { url: '/pdf/to-image', multi: false, accept: '.pdf', extra: 'dpi' },
  'pdf-from-image': { url: '/pdf/from-image', multi: true, accept: '.png,.jpg,.jpeg' },
  'image-convert': { url: '/image/convert', multi: false, accept: 'image/*', extra: 'imgFormat' },
  'doc-convert': { url: '/doc/convert', multi: false, accept: '.docx,.md,.html,.txt,.rtf,.odt', extra: 'format' },
}

/** 当前工具元数据（保证非空，默认回退 pdf-merge） */
const meta = computed<FileToolMeta>(() => fileToolMeta[f.tool] ?? fileToolMeta['pdf-merge']!)

async function runFile() {
  const m = meta.value
  if (f.files.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }
  fileLoading.value = true
  try {
    const fields: Record<string, string | File | File[]> = {}
    const raws = f.files.map((x) => x.raw as File).filter(Boolean)
    if (m.multi) fields.files = raws
    else if (raws[0]) fields.file = raws[0]

    if (m.extra === 'range') fields.range = f.range
    if (m.extra === 'text') fields.text = f.text
    if (m.extra === 'password') fields.password = f.password
    if (m.extra === 'dpi') fields.dpi = String(f.dpi)
    if (m.extra === 'format') fields.format = f.format
    if (m.extra === 'imgFormat') fields.format = f.imgFormat

    const r = await fileProcess(m.url, fields)
    if (r.kind === 'blob') {
      const url = URL.createObjectURL(r.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = r.filename || 'result'
      a.click()
      URL.revokeObjectURL(url)
      ElMessage.success('处理成功，已触发下载')
    } else {
      ElMessage.success('处理成功（JSON）')
      queryResult.value = r.data
    }
  } finally {
    fileLoading.value = false
  }
}
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <span class="brand-mono">工具试用台</span>
      <span class="hint">直接调用后端工具接口，验证处理是否正常（需后端运行在 8989）</span>
    </template>

    <el-tabs v-model="activeTab">
      <!-- 查询类 -->
      <el-tab-pane label="查询类" name="query">
        <el-form :inline="true">
          <el-form-item label="工具">
            <el-select v-model="q.tool" style="width: 180px">
              <el-option label="IP 归属地" value="ip-location" />
              <el-option label="手机号归属地" value="phone-location" />
              <el-option label="邮编查询" value="zipcode" />
              <el-option label="地理编码（正向）" value="geocode-forward" />
              <el-option label="地理编码（逆向）" value="geocode-reverse" />
            </el-select>
          </el-form-item>

          <el-form-item v-if="q.tool === 'ip-location'" label="IP">
            <el-input v-model="q.ip" placeholder="留空取本机出口IP" style="width: 200px" />
          </el-form-item>
          <el-form-item v-if="q.tool === 'phone-location'" label="手机号">
            <el-input v-model="q.phone" placeholder="11位手机号" style="width: 200px" />
          </el-form-item>
          <el-form-item v-if="q.tool === 'zipcode'" label="关键词">
            <el-input v-model="q.zip" placeholder="区县名 或 邮编" style="width: 200px" />
          </el-form-item>
          <template v-if="q.tool === 'geocode-forward'">
            <el-form-item label="地址">
              <el-input v-model="q.address" placeholder="如 北京市朝阳区望京" style="width: 200px" />
            </el-form-item>
            <el-form-item label="城市">
              <el-input v-model="q.city" placeholder="可选" style="width: 120px" />
            </el-form-item>
          </template>
          <template v-if="q.tool === 'geocode-reverse'">
            <el-form-item label="经度">
              <el-input v-model="q.lng" placeholder="lng" style="width: 130px" />
            </el-form-item>
            <el-form-item label="纬度">
              <el-input v-model="q.lat" placeholder="lat" style="width: 130px" />
            </el-form-item>
          </template>

          <el-form-item>
            <el-button type="primary" :loading="queryLoading" @click="runQuery">查询</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 文件类 -->
      <el-tab-pane label="文件处理类" name="file">
        <el-form :inline="true">
          <el-form-item label="工具">
            <el-select v-model="f.tool" style="width: 180px" @change="f.files = []">
              <el-option label="PDF 合并" value="pdf-merge" />
              <el-option label="PDF 拆分" value="pdf-split" />
              <el-option label="PDF 加水印" value="pdf-watermark" />
              <el-option label="PDF 加密" value="pdf-encrypt" />
              <el-option label="PDF 转图片" value="pdf-to-image" />
              <el-option label="图片转 PDF" value="pdf-from-image" />
              <el-option label="图片格式转换" value="image-convert" />
              <el-option label="文档转换" value="doc-convert" />
            </el-select>
          </el-form-item>

          <el-form-item v-if="meta.extra === 'range'" label="页码范围">
            <el-input v-model="f.range" placeholder="如 1-3,5" style="width: 140px" />
          </el-form-item>
          <el-form-item v-if="meta.extra === 'text'" label="水印文字">
            <el-input v-model="f.text" placeholder="英文/数字" style="width: 140px" />
          </el-form-item>
          <el-form-item v-if="meta.extra === 'password'" label="密码">
            <el-input v-model="f.password" style="width: 140px" />
          </el-form-item>
          <el-form-item v-if="meta.extra === 'dpi'" label="DPI">
            <el-input-number v-model="f.dpi" :min="72" :max="300" />
          </el-form-item>
          <el-form-item v-if="meta.extra === 'imgFormat'" label="目标格式">
            <el-select v-model="f.imgFormat" style="width: 110px">
              <el-option label="png" value="png" />
              <el-option label="jpg" value="jpg" />
              <el-option label="bmp" value="bmp" />
              <el-option label="gif" value="gif" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="meta.extra === 'format'" label="目标格式">
            <el-select v-model="f.format" style="width: 110px">
              <el-option label="md" value="md" />
              <el-option label="html" value="html" />
              <el-option label="docx" value="docx" />
              <el-option label="txt" value="txt" />
            </el-select>
          </el-form-item>
        </el-form>

        <el-upload v-model:file-list="f.files" :auto-upload="false"
          :multiple="meta.multi" :accept="meta.accept" :limit="20">
          <el-button type="primary" plain>选择文件</el-button>
          <template #tip>
            <div class="hint">接受：{{ meta.accept }}{{ meta.multi ? '（可多选）' : '' }}</div>
          </template>
        </el-upload>

        <el-button class="run-btn" type="primary" :loading="fileLoading" @click="runFile">执行并下载</el-button>
      </el-tab-pane>
    </el-tabs>

    <el-card v-if="queryResult" class="result-card" header="返回结果" shadow="never">
      <pre class="result">{{ JSON.stringify(queryResult, null, 2) }}</pre>
    </el-card>
  </el-card>
</template>

<style scoped>
.hint {
  color: #a1907f;
  font-size: 12px;
  margin-left: 10px;
}
.run-btn {
  margin-top: 14px;
}
.result-card {
  margin-top: 16px;
}
.result {
  margin: 0;
  font-family: var(--font-mono, monospace);
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-all;
  color: #2a211a;
}
</style>
