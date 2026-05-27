import { useAppAccountStore } from '@/store/modules/app/account'

/**
 * 校验权限
 * @param permissions 权限数组
 * @returns 是否有权限
 */
export function checkPermi(permissions: string[]): boolean {
  const appAccountStore = useAppAccountStore()
  const allPermissions = appAccountStore.permissions || []

  // 检查是否拥有任一权限
  return permissions.some(permission => allPermissions.includes(permission))
}
