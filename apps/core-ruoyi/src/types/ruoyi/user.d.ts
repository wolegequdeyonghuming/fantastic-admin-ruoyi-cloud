declare interface LoginForm {
  username: string
  password: string
  remember?: boolean
  code?: string
  uuid?: string
  tenantId?: string
  clientId?: string
  grantType?: string
}

declare interface CaptchaItem {
  captchaEnabled: boolean
  img: string
  uuid: string
}

declare interface TenantList {
  tenantEnabled: boolean
  voList: TenantItem[]
}

declare interface TenantItem {
  companyName: string
  tenantId: string
}

/**
 * 角色信息
 */
export interface Role {
  roleId: number
  roleName: string
  roleKey: string
  roleSort: number
  dataScope: string
  menuCheckStrictly?: boolean
  deptCheckStrictly?: boolean
  status: string
  remark?: string
  createTime?: string
  flag: boolean
  superAdmin: boolean
}

/**
 * 用户信息
 */
export interface User {
  userId: number
  tenantId: string
  deptId: number
  userName: string
  nickName?: string
  userType?: string
  email?: string
  phonenumber?: string
  sex?: string
  avatar?: string
  status?: string
  loginIp?: string
  loginDate?: string
  remark?: string
  createTime?: string
  updateTime?: string
  deptName?: string
  roles?: Role[]
  roleIds?: number[]
  postIds?: number[]
  roleId?: number
}

/**
 * getInfo 接口响应数据
 */
export interface UserInfoRes {
  user: User
  permissions: string[]
  roles: string[]
}
