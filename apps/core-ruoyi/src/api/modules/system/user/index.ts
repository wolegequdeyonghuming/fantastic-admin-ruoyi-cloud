import type { AxiosPromise } from 'axios'
import type { DeptTreeVO, RoleVO, UserForm, UserInfoVO, UserQuery, UserVO } from './types'
import type { PageResponse, R } from '@/types/ruoyi/common'
import api from '@/api'

// 查询用户列表
export function listUser(query: UserQuery) {
  return api.get<PageResponse<UserVO>>('/system/user/list', { params: query })
}

// 查询用户详细
export function getUser(userId?: number | string) {
  return api.get<R<{ user: UserVO, posts: any[], roles: any[], postIds: number[], roleIds: number[] }>>(`/system/user/${userId || ''}`)
}

// 新增用户
export function addUser(data: UserForm) {
  return api.post('/system/user', data)
}

// 修改用户
export function updateUser(data: UserForm) {
  return api.put('/system/user', data)
}

// 删除用户
export function delUser(userId: number | string | Array<number | string>) {
  return api.delete(`/system/user/${userId}`)
}

// 用户密码重置
export function resetUserPwd(userId: number | string, password: string) {
  return api.put('/system/user/resetPwd', { userId, password })
}

// 用户状态修改
export function changeUserStatus(userId: number | string, status: string) {
  return api.put('/system/user/changeStatus', { userId, status })
}

// 查询部门下拉树结构
export function deptTreeSelect() {
  return api.get<R<DeptTreeVO[]>>('/system/user/deptTree')
}

// 下载用户导入模板
export function importTemplate() {
  return api.get('/system/user/importTemplate', { responseType: 'blob' })
}

// 根据部门ID查询用户列表
export function listUserByDeptId(deptId: number | string) {
  return api.get<R<UserVO[]>>(`/system/user/listByDeptId/${deptId}`)
}

/**
 * 查询授权角色
 * @param userId 用户ID
 */
export function getAuthRole(userId: string | number): AxiosPromise<{ user: UserVO, roles: RoleVO[] }> {
  return api({
    url: `/system/user/authRole/${userId}`,
    method: 'get',
  })
}

export function updateAuthRole(data: { userId: string, roleIds: string }) {
  return api({
    url: '/system/user/authRole',
    method: 'put',
    params: data,
  })
}

/**
 * 查询用户个人信息
 */
export function getUserProfile(): AxiosPromise<UserInfoVO> {
  return api({
    url: '/system/user/profile',
    method: 'get',
  })
}

/**
 * 用户密码重置
 * @param oldPassword 旧密码
 * @param newPassword 新密码
 */
export function updateUserPwd(oldPassword: string, newPassword: string) {
  const data = {
    oldPassword,
    newPassword,
  }
  return api({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    headers: {
      isEncrypt: true,
      repeatSubmit: false,
    },
    data,
  })
}

/**
 * 用户头像上传
 * @param data 头像文件
 */
export function uploadAvatar(data: FormData) {
  return api({
    url: '/system/user/profile/avatar',
    method: 'post',
    data,
  })
}

/**
 * 修改用户个人信息
 * @param data 用户信息
 */
export function updateUserProfile(data: UserForm) {
  return api({
    url: '/system/user/profile',
    method: 'put',
    data,
  })
}

export default {
  listUser,
  getUser,
  addUser,
  updateUser,
  delUser,
  resetUserPwd,
  changeUserStatus,
  deptTreeSelect,
  importTemplate,
}
