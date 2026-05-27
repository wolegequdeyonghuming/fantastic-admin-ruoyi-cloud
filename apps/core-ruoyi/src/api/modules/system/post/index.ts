import type { PostForm, PostQuery, PostVO } from './types'
import type { PageResponse, R } from '@/types/ruoyi/common'
import api from '@/api'

// 查询岗位列表
export function listPost(query: PostQuery) {
  return api.get<PageResponse<PostVO>>('/system/post/list', { params: query })
}

// 查询岗位详细
export function getPost(postId: number | string) {
  return api.get<R<PostVO>>(`/system/post/${postId}`)
}

// 新增岗位
export function addPost(data: PostForm) {
  return api.post('/system/post', data)
}

// 修改岗位
export function updatePost(data: PostForm) {
  return api.put('/system/post', data)
}

// 删除岗位
export function delPost(postId: number | string | Array<number | string>) {
  return api.delete(`/system/post/${postId}`)
}

// 查询部门下拉树结构
export function deptTreeSelect() {
  return api.get<R<any[]>>('/system/post/deptTree')
}

// 查询岗位选择框列表
export function optionselect(deptId?: number | string) {
  return api.get<R<any[]>>(deptId ? `/system/post/optionselect/${deptId}` : '/system/post/optionselect')
}
