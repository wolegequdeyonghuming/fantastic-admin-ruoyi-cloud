import type { BaseEntity, PageQuery } from '@/types/ruoyi/common'

export interface TenantPkgVO extends BaseEntity {
  packageId: number | string
  packageName: string
  menuIds?: number[]
  remark?: string
  status?: string
}

export interface TenantPkgForm {
  packageId?: number | string
  packageName?: string
  menuIds?: number[]
  remark?: string
  status?: string
}

export interface TenantPkgQuery extends PageQuery {
  packageName?: string
}
