import type { TenantPkgForm, TenantPkgQuery, TenantPkgVO } from './types'
import type { PageResponse, R } from '@/types/ruoyi/common'
import api from '@/api'

// 查询租户套餐列表
export function listTenantPackage(query: TenantPkgQuery) {
  return api.get<PageResponse<TenantPkgVO>>('/system/tenantPackage/list', { params: query })
}

// 查询租户套餐详细
export function getTenantPackage(packageId: number | string) {
  return api.get<R<TenantPkgVO>>(`/system/tenantPackage/${packageId}`)
}

// 新增租户套餐
export function addTenantPackage(data: TenantPkgForm) {
  return api.post('/system/tenantPackage', data)
}

// 修改租户套餐
export function updateTenantPackage(data: TenantPkgForm) {
  return api.put('/system/tenantPackage', data)
}

// 删除租户套餐
export function delTenantPackage(packageId: number | string | Array<number | string>) {
  return api.delete(`/system/tenantPackage/${packageId}`)
}

// 租户套餐状态修改
export function changePackageStatus(packageId: number | string, status: string) {
  return api.put('/system/tenantPackage/changeStatus', { packageId, status })
}

// 查询租户套餐下拉列表
export function selectTenantPackage() {
  return api.get<R<TenantPkgVO[]>>('/system/tenantPackage/selectList')
}
