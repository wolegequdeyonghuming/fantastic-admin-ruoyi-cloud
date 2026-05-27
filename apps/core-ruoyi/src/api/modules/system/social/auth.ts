import api from '@/api'

// 获取跳转URL
export function authRouterUrl(source: string, tenantId: string) {
  return api({
    url: `/auth/binding/${source}`,
    method: 'get',
    params: {
      tenantId,
      domain: window.location.host,
    },
  })
}

// 解绑账号
export function authUnlock(authId: string) {
  return api({
    url: `/auth/unlock/${authId}`,
    method: 'delete',
  })
}
// 获取授权列表
export function getAuthList() {
  return api({
    url: '/system/social/list',
    method: 'get',
  })
}
