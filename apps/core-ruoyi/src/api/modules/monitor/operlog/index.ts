import api from '@/api'
import type { OperLogQuery, OperLogVO } from './types'
import type { PageResponse } from '@/types/ruoyi/common'

// 查询操作日志列表
export function list(query: OperLogQuery) {
  return api.get<PageResponse<OperLogVO>>('/monitor/operlog/list', {
    params: query,
  })
}

// 删除操作日志
export function delOperlog(operId: string | number | Array<string | number>) {
  return api.delete(`/monitor/operlog/${operId}`)
}

// 清空操作日志
export function cleanOperlog() {
  return api.delete('/monitor/operlog/clean')
}
