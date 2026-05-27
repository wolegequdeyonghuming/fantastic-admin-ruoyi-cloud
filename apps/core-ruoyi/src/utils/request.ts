import { useAppAccountStore } from '@/store/modules/app/account'

/**
 * 获取全局请求头
 */
export function globalHeaders() {
  const appAccountStore = useAppAccountStore()
  return {
    Authorization: `Bearer ${appAccountStore.token}`,
    Token: appAccountStore.token,
    clientid: import.meta.env.VITE_APP_CLIENT_ID,
  }
}
