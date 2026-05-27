import type { DeptTreeOption, RoleForm, RoleQuery, RoleVO } from './types'
import type { PageResponse, R } from '@/types/ruoyi/common'
import api from '@/api'

// 查询角色列表
export function listRole(query: RoleQuery) {
  return api.get<PageResponse<RoleVO>>('/system/role/list', { params: query })
}

// 查询角色详细
export function getRole(roleId: number | string) {
  return api.get<R<RoleVO>>(`/system/role/${roleId}`)
}

// 新增角色
export function addRole(data: RoleForm) {
  return api.post('/system/role', data)
}

// 修改角色
export function updateRole(data: RoleForm) {
  return api.put('/system/role', data)
}

// 删除角色
export function delRole(roleId: number | string | Array<number | string>) {
  return api.delete(`/system/role/${roleId}`)
}

// 角色数据权限
export function dataScope(data: RoleForm) {
  return api.put('/system/role/dataScope', data)
}

// 角色状态修改
export function changeRoleStatus(roleId: number | string, status: string) {
  return api.put('/system/role/changeStatus', { roleId, status })
}

// 查询角色已授权用户列表
export function allocatedUserList(query: any) {
  return api.get<PageResponse<any>>('/system/role/authUser/allocatedList', { params: query })
}

// 查询角色未授权用户列表
export function unallocatedUserList(query: any) {
  return api.get<PageResponse<any>>('/system/role/authUser/unallocatedList', { params: query })
}

// 取消用户授权角色
export function authUserCancel(data: { userId: number | string, roleId: number | string }) {
  return api.put('/system/role/authUser/cancel', data)
}

// 批量取消用户授权角色
export function authUserCancelAll(data: { userIds: string, roleId: number | string }) {
  return api.put('/system/role/authUser/cancelAll', data)
}

// 授权用户选择
export function authUserSelectAll(data: { userIds: string, roleId: number | string }) {
  return api.put('/system/role/authUser/selectAll', data)
}

// 根据角色ID查询部门树结构
export function deptTreeSelect(roleId: number | string) {
  return api.get<R<{ depts: DeptTreeOption[], checkedKeys: number[] }>>(`/system/role/deptTree/${roleId}`)
}

// 修改权限
export function updateMenuPermission(data: any) {
  return api({
    url: '/system/role',
    method: 'put',
    data,
  })
}
