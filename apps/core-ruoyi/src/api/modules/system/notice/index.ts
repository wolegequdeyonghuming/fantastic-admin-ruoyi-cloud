import type { NoticeForm, NoticeQuery, NoticeVO } from './types'
import type { PageResponse, R } from '@/types/ruoyi/common'
import api from '@/api'

// 查询公告列表
export function listNotice(query: NoticeQuery) {
  return api.get<PageResponse<NoticeVO>>('/system/notice/list', { params: query })
}

// 查询公告详细
export function getNotice(noticeId: number | string) {
  return api.get<R<NoticeVO>>(`/system/notice/${noticeId}`)
}

// 新增公告
export function addNotice(data: NoticeForm) {
  return api.post('/system/notice', data)
}

// 修改公告
export function updateNotice(data: NoticeForm) {
  return api.put('/system/notice', data)
}

// 删除公告
export function delNotice(noticeId: number | string | Array<number | string>) {
  return api.delete(`/system/notice/${noticeId}`)
}
