import type { BaseEntity, PageQuery } from '@/types/ruoyi/common'

export interface OssVO extends BaseEntity {
  ossId: number | string
  fileName: string
  originalName: string
  fileSuffix: string
  url: string
  createByName?: string
  service?: string
}

export interface OssForm {
  file?: File | any
}

export interface OssQuery extends PageQuery {
  fileName?: string
  originalName?: string
  fileSuffix?: string
  createTime?: string
  service?: string
  orderByColumn?: string
  isAsc?: string
}
