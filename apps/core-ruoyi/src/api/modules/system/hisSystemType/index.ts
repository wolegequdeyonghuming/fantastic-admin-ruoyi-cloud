import type { SystemTypeForm, SystemTypeQuery, SystemTypeVO } from './types'
import type { PageResponse, R } from '@/types/ruoyi/common'
import api from '@/api'

// 查询系统类型列表
export function listSystemType(query: SystemTypeQuery) {
  return api.get<PageResponse<SystemTypeVO>>('/system/hisSystemType/list', { params: query })
}

// 查询系统类型详细
export function getSystemType(id: number | string) {
  return api.get<R<SystemTypeVO>>(`/system/hisSystemType/${id}`)
}

// 新增系统类型
export function addSystemType(data: SystemTypeForm) {
  return api.post('/system/hisSystemType', data)
}

// 修改系统类型
export function updateSystemType(data: SystemTypeForm) {
  return api.put('/system/hisSystemType', data)
}

// 删除系统类型
export function delSystemType(id: number | string | Array<number | string>) {
  return api.delete(`/system/hisSystemType/${id}`)
}
