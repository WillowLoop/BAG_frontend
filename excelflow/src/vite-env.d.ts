/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_MAX_FILE_SIZE_MB?: string
  readonly VITE_POLLING_INTERVAL_MS?: string
  readonly VITE_UPLOAD_TIMEOUT_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
