import type { AxiosPromise } from 'axios'
import type { NavigationForm, NavigationMenuForm, NavigationMenuVO, NavigationQuery, NavigationVO } from './types'
import api from '@/api'

/**
 * 查询导航列表
 */
export function listNavigation(query: NavigationQuery): AxiosPromise<NavigationVO[]> {
  return api({
    url: '/system/portal/navigation/list',
    method: 'get',
    params: query,
  })
}

/**
 * 查询导航详细
 */
export function getNavigation(id: string | number): AxiosPromise<NavigationVO> {
  return api({
    url: `/system/portal/navigation/${id}`,
    method: 'get',
  })
}

/**
 * 新增导航
 */
export function addNavigation(data: NavigationForm) {
  return api({
    url: '/system/portal/navigation',
    method: 'post',
    data,
  })
}

/**
 * 修改导航
 */
export function updateNavigation(data: NavigationForm) {
  return api({
    url: '/system/portal/navigation',
    method: 'put',
    data,
  })
}

/**
 * 删除导航
 */
export function delNavigation(id: string | number | Array<string | number>) {
  return api({
    url: `/system/portal/navigation/${id}`,
    method: 'delete',
  })
}

// ==================== 导航菜单管理 ====================

/**
 * 查询导航菜单列表
 */
export function listNavigationMenu(navigationId: string | number): AxiosPromise<NavigationMenuVO[]> {
  return api({
    url: `/system/portal/navigation/menu/list/${navigationId}`,
    method: 'get',
  })
}

/**
 * 查询导航菜单详细
 */
export function getNavigationMenu(id: string | number): AxiosPromise<NavigationMenuVO> {
  return api({
    url: `/system/portal/navigation/menu/${id}`,
    method: 'get',
  })
}

/**
 * 新增导航菜单
 */
export function addNavigationMenu(data: NavigationMenuForm) {
  return api({
    url: '/system/portal/navigation/menu',
    method: 'post',
    data,
  })
}

/**
 * 修改导航菜单
 */
export function updateNavigationMenu(data: NavigationMenuForm) {
  return api({
    url: '/system/portal/navigation/menu',
    method: 'put',
    data,
  })
}

/**
 * 删除导航菜单
 */
export function delNavigationMenu(id: string | number | Array<string | number>) {
  return api({
    url: `/system/portal/navigation/menu/${id}`,
    method: 'delete',
  })
}
