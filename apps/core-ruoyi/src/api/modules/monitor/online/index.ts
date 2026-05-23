import api from '@/api'
import type { OnlineQuery, OnlineVO } from './types'
import type { PageResult } from '@/types/ruoyi/common'

// 查询在线用户列表
export function list(query: OnlineQuery) {
  return api.get<PageResult<OnlineVO>>('/monitor/online/list', {
    params: query,
  })
}

// 强退用户
export function forceLogout(tokenId: string) {
  return api.delete(`/monitor/online/${tokenId}`)
}

// 获取当前用户登录在线设备
export function getOnline() {
  return api.get('/monitor/online')
}

// 删除当前在线设备
export function delOnline(tokenId: string) {
  return api.delete(`/monitor/online/myself/${tokenId}`)
}
