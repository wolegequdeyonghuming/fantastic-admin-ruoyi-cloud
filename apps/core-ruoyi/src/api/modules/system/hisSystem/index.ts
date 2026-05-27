import type { SystemForm, SystemQuery, SystemVO } from './types'
import type { PageResponse, R } from '@/types/ruoyi/common'
import api from '@/api'

// 查询系统列表
export function listSystem(query: SystemQuery) {
  return api.get<PageResponse<SystemVO>>('/system/hisSystem/list', { params: query })
}

// 查询系统详细
export function getSystem(id: number | string) {
  return api.get<R<SystemVO>>(`/system/hisSystem/${id}`)
}

// 新增系统
export function addSystem(data: SystemForm) {
  return api.post('/system/hisSystem', data)
}

// 修改系统
export function updateSystem(data: SystemForm) {
  return api.put('/system/hisSystem', data)
}

// 删除系统
export function delSystem(id: number | string | Array<number | string>) {
  return api.delete(`/system/hisSystem/${id}`)
}
