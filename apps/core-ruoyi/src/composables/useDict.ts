import type { DictDataOption } from '@/types/ruoyi/dict'
import { getDicts } from '@/api/modules/system/dict/data'
import { useDictStore } from '@/store/modules/app/dict'

/**
 * 字典组合式函数
 * 用于在组件中获取和使用字典数据
 */
export function useDict() {
  const dictStore = useDictStore()

  /**
   * 获取字典选项列表
   * @param dictType 字典类型
   * @returns 字典选项数组
   */
  function getDictOptions(dictType: string): DictDataOption[] {
    const dictData = dictStore.getDict(dictType)
    return dictData || []
  }

  /**
   * 根据字典值获取标签
   * @param dictType 字典类型
   * @param value 字典值
   * @returns 字典标签
   */
  function getDictLabel(dictType: string, value: string | number): string {
    const options = getDictOptions(dictType)
    const item = options.find(opt => opt.value === String(value))
    return item?.label || String(value)
  }

  /**
   * 加载字典数据（如果不存在）
   * @param dictTypes 字典类型数组
   */
  async function loadDicts(...dictTypes: string[]) {
    const promises = dictTypes.map(async (dictType) => {
      if (!dictStore.getDict(dictType)) {
        try {
          const res = await getDicts(dictType)
          const dictData = res.data.data || []
          const options: DictDataOption[] = dictData.map((item: any) => ({
            label: item.dictLabel,
            value: item.dictValue,
            elTagType: item.listClass,
            elTagClass: item.cssClass,
          }))
          dictStore.setDict(dictType, options)
        }
        catch (error) {
          console.error(`加载字典 ${dictType} 失败:`, error)
        }
      }
    })
    await Promise.all(promises)
  }

  /**
   * 解析时间字符串
   * @param time 时间值
   * @param pattern 格式化模式
   * @returns 格式化后的时间字符串
   */
  function parseTime(time: string | number | Date, pattern = '{y}-{m}-{d} {h}:{i}:{s}'): string {
    if (!time)
      return ''

    const date = new Date(time)
    const formatObj: Record<string, number> = {
      y: date.getFullYear(),
      m: date.getMonth() + 1,
      d: date.getDate(),
      h: date.getHours(),
      i: date.getMinutes(),
      s: date.getSeconds(),
      a: date.getDay(),
    }

    return pattern.replace(/{([ymdhisa])+}/g, (_, key) => {
      const value = formatObj[key]
      if (key === 'a')
        return ['日', '一', '二', '三', '四', '五', '六'][value]
      return value.toString().padStart(2, '0')
    })
  }

  return {
    getDictOptions,
    getDictLabel,
    loadDicts,
    parseTime,
  }
}
