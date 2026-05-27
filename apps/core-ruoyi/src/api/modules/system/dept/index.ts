import type { DeptForm, DeptQuery, DeptTreeVO, DeptVO } from './types'
import type { R } from '@/types/ruoyi/common'
import api from '@/api'

// 查询部门列表
export function listDept(query?: DeptQuery) {
  return api.get<R<DeptVO[]>>('/system/dept/list', { params: query })
}

// 查询部门列表（排除节点）
export function listDeptExcludeChild(deptId: number | string) {
  return api.get<R<DeptVO[]>>(`/system/dept/list/exclude/${deptId}`)
}

// 查询部门详细
export function getDept(deptId: number | string) {
  return api.get<R<DeptVO>>(`/system/dept/${deptId}`)
}

// 查询部门下拉树结构
export function deptTreeSelect() {
  return api.get<R<DeptTreeVO[]>>('/system/dept/treeselect')
}

// 新增部门
export function addDept(data: DeptForm) {
  return api.post('/system/dept', data)
}

// 修改部门
export function updateDept(data: DeptForm) {
  return api.put('/system/dept', data)
}

// 删除部门
export function delDept(deptId: number | string) {
  return api.delete(`/system/dept/${deptId}`)
}
