/**
 * 若依基础类型定义
 * 最小化版本，仅包含必要类型
 */

/** 分页查询基础接口 */
export interface PageQuery {
  pageNum: number
  pageSize: number
  orderByColumn?: string
  isAsc?: string
  params?: Record<string, any>
}

/** 实体基础接口 */
export interface BaseEntity {
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
  remark?: string
}

/** Element Plus Tag 类型 */
export type ElTagType = 'primary' | 'success' | 'info' | 'warning' | 'danger' | ''

/** 若依标准响应结构 */
export interface R<T = any> {
  code: number
  msg: string
  data: T
  rows?: T
  total?: number
}

/** 分页数据 */
export interface PageResult<T> {
  rows: T[]
  total: number
  totalSum?: number | null
}

/** 若依分页响应结构（直接返回，非嵌套在data中） */
export interface PageResponse<T> extends PageResult<T> {
  code: number
  msg: string
}

/** 字典数据选项 */
export interface DictDataOption {
  label: string
  value: string
  elTagType?: ElTagType
  elTagClass?: string
}

declare global {
  /** 分页查询基础接口 */
  interface PageQuery {
    pageNum: number
    pageSize: number
    orderByColumn?: string
    isAsc?: string
    params?: Record<string, any>
  }

  /** 实体基础接口 */
  interface BaseEntity {
    createBy?: string
    createTime?: string
    updateBy?: string
    updateTime?: string
    remark?: string
  }

  /** Element Plus Tag 类型 */
  type ElTagType = 'primary' | 'success' | 'info' | 'warning' | 'danger' | ''

  /** 字典数据选项 */
  interface DictDataOption {
    label: string
    value: string
    elTagType?: ElTagType
    elTagClass?: string
  }
}

export {}
