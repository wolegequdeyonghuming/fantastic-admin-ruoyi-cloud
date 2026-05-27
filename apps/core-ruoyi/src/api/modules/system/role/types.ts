import type { BaseEntity, PageQuery } from '@/types/ruoyi/common'

export interface RoleVO extends BaseEntity {
  roleId: number | string
  roleName: string
  roleKey: string
  roleSort: number
  dataScope?: string
  menuCheckStrictly?: boolean
  deptCheckStrictly?: boolean
  status?: string
  flag?: boolean
  menuIds?: number[]
  deptIds?: number[]
  admin?: boolean
}

export interface RoleForm {
  roleId?: number | string
  roleName?: string
  roleKey?: string
  roleSort?: number
  status?: string
  menuCheckStrictly?: boolean
  deptCheckStrictly?: boolean
  remark?: string
  dataScope?: string
  menuIds?: number[]
  deptIds?: number[]
}

export interface RoleQuery extends PageQuery {
  roleName?: string
  roleKey?: string
  status?: string
}

export interface DeptTreeOption {
  id: number | string
  label: string
  children?: DeptTreeOption[]
}
