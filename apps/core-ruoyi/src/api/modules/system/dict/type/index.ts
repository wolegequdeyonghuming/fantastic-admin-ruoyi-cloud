import type { DictTypeForm, DictTypeQuery, DictTypeVO } from './types'
import type { PageResponse, R } from '@/types/ruoyi/common'
import api from '@/api'

export function listType(query: DictTypeQuery) {
  return api.get<PageResponse<DictTypeVO>>('/system/dict/type/list', { params: query })
}

export function getType(dictId: number | string) {
  return api.get<R<DictTypeVO>>(`/system/dict/type/${dictId}`)
}

export function addType(data: DictTypeForm) {
  return api.post('/system/dict/type', data)
}

export function updateType(data: DictTypeForm) {
  return api.put('/system/dict/type', data)
}

export function delType(dictId: string | number | Array<string | number>) {
  return api.delete(`/system/dict/type/${dictId}`)
}

export function refreshCache() {
  return api.delete('/system/dict/type/refreshCache')
}

export function optionselect() {
  return api.get<R<DictTypeVO[]>>('/system/dict/type/optionselect')
}
