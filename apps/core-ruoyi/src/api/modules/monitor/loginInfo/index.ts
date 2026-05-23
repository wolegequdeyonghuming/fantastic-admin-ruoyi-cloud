import api from '@/api'
import type { LoginInfoQuery, LoginInfoVO } from './types'
import type { PageResult } from '@/types/ruoyi/common'

// 查询登录日志列表
export function list(query: LoginInfoQuery) {
  return api.get<PageResult<LoginInfoVO>>('/monitor/logininfor/list', {
    params: query,
  })
}

// 删除登录日志
export function delLoginInfo(infoId: string | number | Array<string | number>) {
  return api.delete(`/monitor/logininfor/${infoId}`)
}

// 解锁用户登录状态
export function unlockLoginInfo(userName: string | Array<string>) {
  return api.get(`/monitor/logininfor/unlock/${userName}`)
}

// 清空登录日志
export function cleanLoginInfo() {
  return api.delete('/monitor/logininfor/clean')
}
