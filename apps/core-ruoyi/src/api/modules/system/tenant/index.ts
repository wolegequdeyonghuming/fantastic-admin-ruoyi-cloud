import type { TenantForm, TenantQuery, TenantVO } from './types'
import type { PageResponse, R } from '@/types/ruoyi/common'
import api from '@/api'

// 查询租户列表
export function listTenant(query: TenantQuery) {
  return api.get<PageResponse<TenantVO>>('/system/tenant/list', { params: query })
}

// 查询租户详细
export function getTenant(id: number | string) {
  return api.get<R<TenantVO>>(`/system/tenant/${id}`)
}

// 新增租户
export function addTenant(data: TenantForm) {
  return api.post('/system/tenant', data)
}

// 修改租户
export function updateTenant(data: TenantForm) {
  return api.put('/system/tenant', data)
}

// 删除租户
export function delTenant(id: number | string | Array<number | string>) {
  return api.delete(`/system/tenant/${id}`)
}

// 租户状态修改
export function changeTenantStatus(id: number | string, status: string) {
  return api.put('/system/tenant/changeStatus', { id, status })
}

// 同步租户套餐
export function syncTenantPackage() {
  return api.post<R<string>>('/system/tenant/syncTenantPackage')
}

// 同步租户字典
export function syncTenantDict() {
  return api.post<R<string>>('/system/tenant/syncTenantDict')
}

// 同步租户参数
export function syncTenantConfig() {
  return api.post<R<string>>('/system/tenant/syncTenantConfig')
}
