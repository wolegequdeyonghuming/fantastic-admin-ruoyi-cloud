import type { BaseEntity, PageQuery } from '@/types/ruoyi/common'

export interface SystemVO extends BaseEntity {
  id: number | string
  systemName: string
  systemCode: string
  vendorName?: string
  startDate?: string
  endDate?: string
  systemTypeId?: string
  menuId?: number | string
  systemType?: string
  description?: string
  status?: string | number
  sort?: number
}

export interface SystemForm {
  id?: number | string
  systemName?: string
  systemCode?: string
  vendorName?: string
  startDate?: string
  endDate?: string
  systemTypeId?: string
  menuId?: number | string
  systemType?: string
  description?: string
  status?: string | number
  sort?: number
  dateRange?: string[]
  remark?: string
}

export interface SystemQuery extends PageQuery {
  systemName?: string
  systemCode?: string
  systemTypeId?: string
  systemType?: string
  status?: string | number
}
