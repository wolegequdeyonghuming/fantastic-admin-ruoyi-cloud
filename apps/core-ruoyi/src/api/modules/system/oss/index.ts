import type { OssQuery, OssVO } from './types'
import type { PageResponse } from '@/types/ruoyi/common'
import api from '@/api'

// 查询OSS对象存储列表
export function listOss(query: OssQuery) {
  return api.get<PageResponse<OssVO>>('/system/oss/list', { params: query })
}

// 删除OSS对象存储
export function delOss(ossId: number | string | Array<number | string>) {
  return api.delete(`/system/oss/${ossId}`)
}
