import type { BaseEntity, PageQuery } from '@/types/ruoyi/common'

export interface LoginInfoVO extends BaseEntity {
  infoId: string | number
  tenantId: string | number
  userName: string
  status: string
  ipaddr: string
  loginLocation: string
  browser: string
  os: string
  msg: string
  loginTime: string
}

export interface LoginInfoQuery extends PageQuery {
  ipaddr: string
  userName: string
  status: string
  orderByColumn: string
  isAsc: string
}
