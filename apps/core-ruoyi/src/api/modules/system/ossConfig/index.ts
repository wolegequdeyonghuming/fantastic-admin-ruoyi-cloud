import type { OssConfigForm, OssConfigQuery, OssConfigVO } from './types'
import type { PageResponse, R } from '@/types/ruoyi/common'
import api from '@/api'

export function listOssConfig(query: OssConfigQuery) {
  return api.get<PageResponse<OssConfigVO>>('/system/oss/config/list', { params: query })
}

export function getOssConfig(ossConfigId: number | string) {
  return api.get<R<OssConfigVO>>(`/system/oss/config/${ossConfigId}`)
}

export function delOssConfig(ossConfigId: number | string | Array<number | string>) {
  return api.delete(`/system/oss/config/${ossConfigId}`)
}

export function addOssConfig(data: OssConfigForm) {
  return api.post('/system/oss/config', data)
}

export function updateOssConfig(data: OssConfigForm) {
  return api.put('/system/oss/config', data)
}

export function changeOssConfigStatus(ossConfigId: number | string, status: string, configKey: string) {
  return api.put('/system/oss/config/changeStatus', { ossConfigId, status, configKey })
}
