import type { BaseEntity, PageQuery } from '@/types/ruoyi/common'

export interface PostVO extends BaseEntity {
  postId: number | string
  postCode: string
  postName: string
  postCategory?: string
  postSort: number
  deptName?: string
  deptId?: number | string
  status?: string
  flag?: boolean
}

export interface PostForm {
  postId?: number | string
  postCode?: string
  postName?: string
  postCategory?: string
  postSort?: number
  deptId?: number | string
  status?: string
  remark?: string
}

export interface PostQuery extends PageQuery {
  postCode?: string
  postName?: string
  postCategory?: string
  deptId?: number | string
  belongDeptId?: number | string
  status?: string
}
