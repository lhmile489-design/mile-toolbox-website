/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 是否启用内置 mock（默认 'true'，开箱即跑；设为 'false' 走真实后端） */
  readonly VITE_USE_MOCK?: string
  /** 真实后端基址（VITE_USE_MOCK=false 时生效） */
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
