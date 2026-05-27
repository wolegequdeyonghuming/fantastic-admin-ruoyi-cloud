import type { BaseEntity, PageQuery } from '@/types/ruoyi/common'

export interface UserVO extends BaseEntity {
  userId: number | string
  userName: string
  nickName?: string
  userType?: string
  email?: string
  phonenumber?: string
  sex?: string
  avatar?: string
  password?: string
  status?: string
  delFlag?: string
  loginIp?: string
  loginDate?: string
  deptId?: number
  deptName?: string
  roles?: RoleVO[]
  roleIds?: number[]
  postIds?: number[]
  posts?: PostVO[]
}

export interface UserForm {
  userId?: number | string
  userName?: string
  nickName?: string
  password?: string
  phonenumber?: string
  email?: string
  sex?: string
  status?: string
  remark?: string
  deptId?: number
  postIds?: number[]
  roleIds?: number[]
}

export interface UserQuery extends PageQuery {
  userName?: string
  nickName?: string
  phonenumber?: string
  status?: string
  deptId?: number | string
  roleId?: number | string
}

export interface RoleVO extends BaseEntity {
  roleId: number | string
  roleName: string
  roleKey: string
  roleSort: number
  dataScope?: string
  menuCheckStrictly?: boolean
  deptCheckStrictly?: boolean
  status?: string
  flag?: boolean
  menuIds?: number[]
  deptIds?: number[]
  admin?: boolean
}

export interface PostVO extends BaseEntity {
  postId: number | string
  postCode: string
  postName: string
  postSort: number
  status?: string
  flag?: boolean
}

export interface DeptVO extends BaseEntity {
  id?: number | string
  deptId?: number | string
  parentId?: number | string
  ancestors?: string
  deptName?: string
  deptCategory?: string
  orderNum?: number
  leader?: string | number
  phone?: string
  email?: string
  status?: string
  delFlag?: string
  parentName?: string
  children?: DeptVO[]
  disabled?: boolean
}

export interface DeptTreeVO {
  id: number | string
  label: string
  children?: DeptTreeVO[]
  disabled?: boolean
}

export interface UserInfoVO {
  user: UserVO
  roles: RoleVO[]
  roleIds: string[]
  posts: PostVO[]
  postIds: string[]
  roleGroup: string
  postGroup: string
}

export interface ResetPwdForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}
