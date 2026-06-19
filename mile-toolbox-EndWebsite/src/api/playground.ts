import service, { request } from '@/utils/request'

/** 查询类工具：geocode 正向 */
export function geocodeForward(address: string, city?: string) {
  return request({ url: '/query/geocode', method: 'get', params: { address, city } })
}
/** 查询类工具：geocode 逆向 */
export function geocodeReverse(lng: number, lat: number) {
  return request({ url: '/query/geocode', method: 'get', params: { lng, lat } })
}
/** IP 归属地 */
export function ipLocation(ip?: string) {
  return request({ url: '/query/ip-location', method: 'get', params: { ip } })
}
/** 手机号归属地 */
export function phoneLocation(phone: string) {
  return request({ url: '/query/phone-location', method: 'get', params: { phone } })
}
/** 邮编查询 */
export function zipcode(keyword: string) {
  return request({ url: '/query/zipcode', method: 'get', params: { keyword } })
}

/**
 * 文件类工具通用调用：multipart 上传，按 blob 接收。
 * 返回 { blob, filename } 或在 save 模式下解析 JSON 的 url。
 */
export async function fileProcess(
  url: string,
  fields: Record<string, string | Blob | File | (File[])>,
): Promise<{ kind: 'blob'; blob: Blob; filename: string } | { kind: 'json'; data: unknown }> {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) {
    if (Array.isArray(v)) {
      v.forEach((f) => fd.append(k, f))
    } else {
      fd.append(k, v)
    }
  }
  const resp = await service.post(url, fd, { responseType: 'blob' })
  // axios 拦截器对 blob 不会拆 code；这里拿原始响应
  const blob = resp as unknown as Blob
  const type = blob.type || ''
  if (type.includes('application/json')) {
    const text = await blob.text()
    return { kind: 'json', data: JSON.parse(text) }
  }
  // 从 content-disposition 取文件名（拿不到则用默认）
  return { kind: 'blob', blob, filename: 'result' }
}
