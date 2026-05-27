import type { BaseEntity, PageQuery } from '@/types/ruoyi/common'

export interface TenantVO extends BaseEntity {
  id: number | string
  tenantId: string
  contactUserName?: string
  contactPhone?: string
  companyName?: string
  licenseNumber?: string
  address?: string
  domain?: string
  packageId?: number
  packageName?: string
  accountCount?: number
  expireTime?: string
  status?: string
}

export interface TenantForm {
  id?: number | string
  tenantId?: string
  contactUserName?: string
  contactPhone?: string
  companyName?: string
  licenseNumber?: string
  address?: string
  domain?: string
  packageId?: number
  accountCount?: number
  expireTime?: string
  status?: string
  remark?: string
}

export interface TenantQuery extends PageQuery {
  tenantId?: string
  contactUserName?: string
  contactPhone?: string
  companyName?: string
  status?: string
}
