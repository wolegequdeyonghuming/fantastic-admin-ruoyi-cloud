import type { DictDataOption } from '@/types/ruoyi/dict'
import { getDicts } from '@/api/modules/system/dict/data'
import { useDictStore } from '@/store/modules/app/dict'

/**
 * 获取字典数据（兼容旧版本）
 * @deprecated 建议使用 composables/useDict.ts 中的 useDict
 */
export function useDict(...args: string[]): { [key: string]: DictDataOption[] } {
  const res = ref<{
    [key: string]: DictDataOption[]
  }>({})

  args.forEach(async (dictType) => {
    res.value[dictType] = []
    const dicts = useDictStore().getDict(dictType)
    if (dicts) {
      res.value[dictType] = dicts
    }
    else {
      try {
        const resData = await getDicts(dictType)
        const dictData = resData.data.data || []
        res.value[dictType] = dictData.map(
          (p: any): DictDataOption => ({
            label: p.dictLabel,
            value: p.dictValue,
            elTagType: p.listClass,
            elTagClass: p.cssClass,
          }),
        )
        useDictStore().setDict(dictType, res.value[dictType])
      }
      catch (error) {
        console.error(`加载字典 ${dictType} 失败:`, error)
      }
    }
  })
  return res.value
}
