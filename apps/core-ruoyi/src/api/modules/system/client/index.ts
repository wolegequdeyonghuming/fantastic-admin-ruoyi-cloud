import type { ClientForm, ClientQuery, ClientVO } from './types'
import type { PageResponse, R } from '@/types/ruoyi/common'
import api from '@/api'

// 查询客户端列表
export function listClient(query: ClientQuery) {
  return api.get<PageResponse<ClientVO>>('/system/client/list', { params: query })
}

// 查询客户端详细
export function getClient(id: number | string) {
  return api.get<R<ClientVO>>(`/system/client/${id}`)
}

// 新增客户端
export function addClient(data: ClientForm) {
  return api.post('/system/client', data)
}

// 修改客户端
export function updateClient(data: ClientForm) {
  return api.put('/system/client', data)
}

// 删除客户端
export function delClient(id: number | string | Array<number | string>) {
  return api.delete(`/system/client/${id}`)
}

// 客户端状态修改
export function changeStatus(id: number | string, status: string) {
  return api.put('/system/client/changeStatus', { id, status })
}
