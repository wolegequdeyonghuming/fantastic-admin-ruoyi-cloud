import type { ConfigForm, ConfigQuery, ConfigVO } from './types'
import type { PageResponse, R } from '@/types/ruoyi/common'
import api from '@/api'

// 查询参数列表
export function listConfig(query: ConfigQuery) {
  return api.get<PageResponse<ConfigVO>>('/system/config/list', { params: query })
}

// 查询参数详细
export function getConfig(configId: number | string) {
  return api.get<R<ConfigVO>>(`/system/config/${configId}`)
}

// 根据参数键名查询参数值
export function getConfigKey(configKey: string) {
  return api.get<R<string>>(`/system/config/configKey/${configKey}`)
}

// 新增参数
export function addConfig(data: ConfigForm) {
  return api.post('/system/config', data)
}

// 修改参数
export function updateConfig(data: ConfigForm) {
  return api.put('/system/config', data)
}

// 删除参数
export function delConfig(configId: number | string | Array<number | string>) {
  return api.delete(`/system/config/${configId}`)
}

// 根据参数键名修改参数值
export function updateConfigByKey(configKey: string, configValue: string | boolean) {
  return api.put('/system/config/updateByKey', { configKey, configValue })
}

// 刷新参数缓存
export function refreshCache() {
  return api.delete('/system/config/refreshCache')
}
