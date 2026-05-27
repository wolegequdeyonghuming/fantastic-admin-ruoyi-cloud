import type { BaseEntity, PageQuery } from '@/types/ruoyi/common'

export interface OssConfigVO extends BaseEntity {
  ossConfigId: number | string
  configKey: string
  accessKey: string
  secretKey: string
  bucketName: string
  prefix: string
  endpoint: string
  domain: string
  isHttps: string
  accessPolicy: string
  region: string
  status: string
  remark: string
}

export interface OssConfigForm {
  ossConfigId?: number | string
  configKey?: string
  accessKey?: string
  secretKey?: string
  bucketName?: string
  prefix?: string
  endpoint?: string
  domain?: string
  isHttps?: string
  accessPolicy?: string
  region?: string
  status?: string
  remark?: string
}

export interface OssConfigQuery extends PageQuery {
  configKey?: string
  bucketName?: string
  status?: string
}
