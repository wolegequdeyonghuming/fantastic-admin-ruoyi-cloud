import type { DictDataForm, DictDataQuery, DictDataVO } from './types'
import type { PageResponse, R } from '@/types/ruoyi/common'
import api from '@/api'

// 根据字典类型查询字典数据信息
export function getDicts(dictType: string) {
  return api.get<R<DictDataVO[]>>(`/system/dict/data/type/${dictType}`)
}

// 查询字典数据列表
export function listData(query: DictDataQuery) {
  return api.get<PageResponse<DictDataVO>>('/system/dict/data/list', {
    params: query,
  })
}

// 查询字典数据详细
export function getData(dictCode: string | number) {
  return api.get<R<DictDataVO>>(`/system/dict/data/${dictCode}`)
}

// 新增字典数据
export function addData(data: DictDataForm) {
  return api.post('/system/dict/data', data)
}

// 修改字典数据
export function updateData(data: DictDataForm) {
  return api.put('/system/dict/data', data)
}

// 删除字典数据
export function delData(dictCode: string | number | Array<string | number>) {
  return api.delete(`/system/dict/data/${dictCode}`)
}
