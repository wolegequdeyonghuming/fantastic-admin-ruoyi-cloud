import type { AxiosPromise } from 'axios'
import type { RouteRecordRaw } from 'vue-router'
import type { MenuForm, MenuQuery, MenuTreeOption, MenuVO } from './types'
import type { R } from '@/types/ruoyi/common'
import api from '@/api'

// 查询菜单列表
export function listMenu(query?: MenuQuery) {
  return api.get<R<MenuVO[]>>('/system/menu/list', { params: query })
}

// 查询菜单详细
export function getMenu(menuId: number | string) {
  return api.get<R<MenuVO>>(`/system/menu/${menuId}`)
}

// 查询菜单下拉树结构
export function treeselect() {
  return api.get<R<MenuTreeOption[]>>('/system/menu/treeselect')
}

// 根据角色ID查询菜单下拉树结构
export function roleMenuTreeselect(roleId: number | string) {
  return api.get<R<{ menus: MenuTreeOption[], checkedKeys: number[] }>>(`/system/menu/roleMenuTreeselect/${roleId}`)
}

// 根据租户套餐ID查询菜单下拉树结构
export function tenantPackageMenuTreeselect(packageId: number | string) {
  return api.get<R<{ menus: MenuTreeOption[], checkedKeys: number[] }>>(`/system/menu/tenantPackageMenuTreeselect/${packageId}`)
}

// 新增菜单
export function addMenu(data: MenuForm) {
  return api.post('/system/menu', data)
}

// 修改菜单
export function updateMenu(data: MenuForm) {
  return api.put('/system/menu', data)
}

// 删除菜单
export function delMenu(menuId: number | string) {
  return api.delete(`/system/menu/${menuId}`)
}

// 级联删除菜单
export function cascadeDelMenu(menuIds: (number | string)[]) {
  return api.delete(`/system/menu/cascade/${menuIds.join(',')}`)
}

// 获取子系统列表
export function getChildSystemList(query: PageQuery): AxiosPromise<RouteRecordRaw[]> {
  return api({
    url: '/system/childSystem/systemList',
    method: 'get',
    params: query,
  })
}

// 新增子系统列表
export function addChildSystem(data: any): AxiosPromise<any> {
  return api({
    url: '/system/childSystem/add',
    method: 'post',
    data,
  })
}

// 编辑子系统列表
export function editChildSystem(data: any): AxiosPromise<any> {
  return api({
    url: '/system/childSystem/edit',
    method: 'put',
    data,
  })
}

// 删除子系统列表
export function deleteChildSystem(data: any): AxiosPromise<any> {
  return api({
    url: `/system/childSystem/delete/${data}`,
    method: 'delete',
  })
}
