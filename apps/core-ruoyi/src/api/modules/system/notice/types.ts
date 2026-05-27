import type { BaseEntity, PageQuery } from '@/types/ruoyi/common'

export interface NoticeVO extends BaseEntity {
  noticeId: number | string
  noticeTitle: string
  noticeType: string
  noticeContent?: string
  status?: string
  createByName?: string
}

export interface NoticeForm {
  noticeId?: number | string
  noticeTitle?: string
  noticeType?: string
  noticeContent?: string
  status?: string
  remark?: string
  createByName?: string
}

export interface NoticeQuery extends PageQuery {
  noticeTitle?: string
  noticeType?: string
  createByName?: string
  status?: string
}
