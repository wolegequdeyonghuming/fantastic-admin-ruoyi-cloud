import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveRoutePath(basePath?: string, routePath?: string): string {
  if (!basePath) {
    return routePath ?? ''
  }
  if (!routePath) {
    return basePath
  }
  // 已经是绝对路径，直接返回
  if (routePath.startsWith('/')) {
    return routePath
  }
  // 拼接路径并规范化
  return `${basePath}/${routePath}`.replace(/\/+/g, '/')
}
