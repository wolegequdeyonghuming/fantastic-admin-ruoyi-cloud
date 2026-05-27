import type { BaseEntity } from '@/types/ruoyi/common'

export interface MenuVO extends BaseEntity {
  menuId: number | string
  menuName: string
  parentId?: number | string
  orderNum?: number
  path?: string
  component?: string
  queryParam?: string
  isFrame?: string
  isCache?: string
  menuType?: string
  visible?: string
  status?: string
  perms?: string
  icon?: string
  remark?: string
  children?: MenuVO[]
  hasChildren?: boolean
}

export interface MenuForm {
  menuId?: number | string
  parentId?: number | string
  menuName?: string
  icon?: string
  path?: string
  component?: string
  menuType?: string
  orderNum?: number
  isFrame?: string
  isCache?: string
  visible?: string
  status?: string
  queryParam?: string
  perms?: string
  remark?: string
}

export interface MenuQuery {
  menuName?: string
  status?: string
  systemCode?: string | unknown
}

export interface MenuTreeOption {
  menuId: number | string
  menuName: string
  children?: MenuTreeOption[]
}
