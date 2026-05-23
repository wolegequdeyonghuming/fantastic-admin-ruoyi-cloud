import api from '@/api'
import type { CacheVO } from './types'
import type { R } from '@/types/ruoyi/common'

// 查询缓存详细
export function getCache() {
  return api.get<R<CacheVO>>('/monitor/cache')
}

// 查询缓存名称列表
export function listCacheName() {
  return api.get('/monitor/cache/getNames')
}

// 查询缓存键名列表
export function listCacheKey(cacheName: string) {
  return api.get(`/monitor/cache/getKeys/${cacheName}`)
}

// 查询缓存内容
export function getCacheValue(cacheName: string, cacheKey: string) {
  return api.get(`/monitor/cache/getValue/${cacheName}/${cacheKey}`)
}

// 清理指定名称缓存
export function clearCacheName(cacheName: string) {
  return api.delete(`/monitor/cache/clearCacheName/${cacheName}`)
}

// 清理指定键名缓存
export function clearCacheKey(cacheName: string, cacheKey: string) {
  return api.delete(`/monitor/cache/clearCacheKey/${cacheName}/${cacheKey}`)
}

// 清理全部缓存
export function clearCacheAll() {
  return api.delete('/monitor/cache/clearCacheAll')
}
