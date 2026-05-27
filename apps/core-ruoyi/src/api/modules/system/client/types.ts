import type { BaseEntity, PageQuery } from '@/types/ruoyi/common'

export interface ClientVO extends BaseEntity {
  id: number | string
  clientKey: string
  clientSecret: string
  grantTypeList: string[]
  grantType: string
  deviceType: string
  activeTimeout: number
  timeout: number
  status: string
}

export interface ClientForm {
  id?: number | string
  clientKey?: string
  clientSecret?: string
  grantTypeList?: string[]
  grantType?: string
  deviceType?: string
  activeTimeout?: number
  timeout?: number
  status?: string
  remark?: string
}

export interface ClientQuery extends PageQuery {
  clientKey?: string
  clientSecret?: string
  status?: string
}
