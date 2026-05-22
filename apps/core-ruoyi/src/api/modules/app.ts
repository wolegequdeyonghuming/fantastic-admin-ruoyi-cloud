import type { LoginForm } from '#/ruoyi/user'
import api from '../index'

const CLIENT_ID = import.meta.env.VITE_APP_CLIENT_ID

export default {
  // 后端获取路由数据
  routeList: () => api.get('app/route/list', {
    fake: true,
  }),

  // 登录
  login: (data: LoginForm) => api.post('/auth/login', {
    ...data,
    tenantId: data.tenantId || '000000',
    clientId: data.clientId || CLIENT_ID,
    grantType: data.grantType || 'password',
  }, {
    isToken: false,
    retry: false,
    headers: {
      isEncrypt: true,
      isToken: false,
    },
  }),

  // 修改密码
  passwordEdit: (data: {
    password: string
    newPassword: string
  }) => api.post('app/account/password/edit', data, {
    fake: true,
  }),

  info: () => api.get('/system/user/getInfo'),

  getCaptcha: () => api.get('/auth/code'),

  getTenantList: () => api.get('/auth/tenant/list'),

  logout: () => api.post('/auth/logout'),
}
