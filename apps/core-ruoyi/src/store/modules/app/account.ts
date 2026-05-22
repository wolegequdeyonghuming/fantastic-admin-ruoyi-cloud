import type { LoginForm, UserInfoRes } from '#/ruoyi/user'
import apiApp from '@/api/modules/app'
import router from '@/router'

export const useAppAccountStore = defineStore('appAccount', () => {
  const appSettingsStore = useAppSettingsStore()
  const appTabbarStore = useAppTabbarStore()
  const appRouteStore = useAppRouteStore()
  const appMenuStore = useAppMenuStore()

  // 账号信息
  const token = ref(localStorage.getItem('token') ?? '')
  const username = ref(localStorage.getItem('username') ?? '')
  const nickname = ref(localStorage.getItem('nickname') ?? '')
  const avatar = ref(localStorage.getItem('avatar') ?? '')
  const userId = ref<number | null>(null)

  // 权限信息
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])

  // 登录状态
  const isLogin = computed(() => {
    return !!token.value
  })

  // 是否超级管理员
  const isAdmin = computed(() => {
    return roles.value.includes('superadmin') || roles.value.includes('admin')
  })

  // 登录
  async function login(data: LoginForm) {
    const res = await apiApp.login(data)
    if (res.data.access_token) {
      localStorage.setItem('token', res.data.access_token)
      token.value = res.data.access_token
    }
  }

  /**
   * 获取用户信息和权限
   */
  async function getInfo() {
    const res = await apiApp.info()
    const userInfo = res.data as UserInfoRes

    // 保存用户信息
    userId.value = userInfo.user.userId
    username.value = userInfo.user.userName
    nickname.value = userInfo.user.nickName || userInfo.user.userName
    avatar.value = userInfo.user.avatar || ''
    roles.value = userInfo.roles || []
    permissions.value = userInfo.permissions || []

    // 持久化存储
    localStorage.setItem('username', username.value)
    localStorage.setItem('nickname', nickname.value)
    localStorage.setItem('avatar', avatar.value)

    return userInfo
  }

  /**
   * 获取权限（兼容框架接口）
   * 若依在 getInfo 中已经返回权限，这里直接返回
   */
  async function getPermissions() {
    if (permissions.value.length === 0) {
      await getInfo()
    }
    return permissions.value
  }

  /**
   * 检查是否有某个权限
   * @param permission 权限标识，如: system:user:list
   */
  function hasPermission(permission: string): boolean {
    if (!permission) {
      return true
    }
    if (isAdmin.value) {
      return true
    }
    // 支持通配符权限，如 *:*:* 表示所有权限
    if (permissions.value.includes('*:*:*')) {
      return true
    }
    return permissions.value.includes(permission)
  }

  /**
   * 检查是否有某个角色
   * @param role 角色标识，如: admin
   */
  function hasRole(role: string): boolean {
    if (!role) {
      return true
    }
    return roles.value.includes(role)
  }

  // 手动登出
  async function logout(redirect = router.currentRoute.value.fullPath) {
    await apiApp.logout()
    localStorage.removeItem('token')
    token.value = ''
    router.push({
      name: 'login',
      query: {
        ...(redirect !== appSettingsStore.settings.app.home.fullPath && router.currentRoute.value.name !== 'login' && { redirect }),
      },
    }).then(logoutCleanStatus)
  }

  // 请求登出
  async function requestLogout() {
    await apiApp.logout()
    localStorage.removeItem('token')
    token.value = ''
    router.push({
      name: 'login',
      query: {
        ...(
          router.currentRoute.value.fullPath !== appSettingsStore.settings.app.home.fullPath
          && router.currentRoute.value.name !== 'login'
          && {
            redirect: router.currentRoute.value.fullPath,
          }
        ),
      },
    }).then(logoutCleanStatus)
  }

  // 登出后清除状态
  function logoutCleanStatus() {
    localStorage.removeItem('username')
    localStorage.removeItem('nickname')
    localStorage.removeItem('avatar')

    username.value = ''
    nickname.value = ''
    avatar.value = ''
    userId.value = null
    roles.value = []
    permissions.value = []

    appSettingsStore.updateSettings({}, true)
    appTabbarStore.clean()
    appRouteStore.removeRoutes()
    appMenuStore.setActived(0)
  }

  // 修改密码
  async function editPassword(data: {
    password: string
    newPassword: string
  }) {
    await apiApp.passwordEdit(data)
  }

  // 锁屏
  function lock() {
    localStorage.removeItem('token')
  }

  // 解锁
  function unlock() {
    localStorage.setItem('token', token.value)
  }

  return {
    token,
    username,
    nickname,
    avatar,
    userId,
    permissions,
    roles,
    isLogin,
    isAdmin,
    login,
    logout,
    requestLogout,
    getInfo,
    getPermissions,
    hasPermission,
    hasRole,
    editPassword,
    lock,
    unlock,
  }
})
