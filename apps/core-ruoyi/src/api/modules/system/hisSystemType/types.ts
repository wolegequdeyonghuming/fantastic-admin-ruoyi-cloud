import type { BaseEntity, PageQuery } from '@/types/ruoyi/common'

export interface SystemTypeVO extends BaseEntity {
  id: number | string
  typeName: string
  typeCode?: string
  systemCode?: string
  systemBind?: string
  systemBindName?: string
  systemBindCode?: string
  description?: string
  status?: string | number
  sort?: number
}

export interface SystemTypeForm {
  id?: number | string
  typeName?: string
  typeCode?: string
  systemCode?: string
  systemBind?: string
  description?: string
  status?: string | number
  sort?: number
  remark?: string
}

export interface SystemTypeQuery extends PageQuery {
  typeName?: string
  systemCode?: string
  systemBind?: string
  status?: string | number
  sort?: number
}
