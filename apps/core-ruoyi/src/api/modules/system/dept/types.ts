import type { BaseEntity, PageQuery } from '@/types/ruoyi/common'

export interface DeptVO extends BaseEntity {
  id?: number | string
  deptId?: number | string
  parentId?: number | string
  ancestors?: string
  deptName?: string
  deptCategory?: string
  orderNum?: number
  leader?: string | number
  leaderName?: string
  phone?: string
  email?: string
  status?: string
  delFlag?: string
  parentName?: string
  children?: DeptVO[]
  disabled?: boolean
}

export interface DeptForm {
  deptId?: number | string
  parentId?: number | string
  deptName?: string
  deptCategory?: string
  orderNum?: number
  leader?: string | number
  phone?: string
  email?: string
  status?: string
}

export interface DeptQuery extends PageQuery {
  deptName?: string
  deptCategory?: string
  status?: string
}

export interface DeptTreeVO {
  id: number | string
  label: string
  children?: DeptTreeVO[]
  disabled?: boolean
}
