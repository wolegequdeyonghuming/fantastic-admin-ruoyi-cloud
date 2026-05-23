/**
 * 字典数据选项
 */
export interface DictDataOption {
  /** 标签 */
  label: string
  /** 值 */
  value: string
  /** Element Tag 类型 */
  elTagType?: 'primary' | 'success' | 'info' | 'warning' | 'danger' | ''
  /** Element Tag 类名 */
  elTagClass?: string
}

declare global {
  /**
   * 字典数据选项
   */
  interface DictDataOption {
    /** 标签 */
    label: string
    /** 值 */
    value: string
    /** Element Tag 类型 */
    elTagType?: 'primary' | 'success' | 'info' | 'warning' | 'danger' | ''
    /** Element Tag 类名 */
    elTagClass?: string
  }
}

export {}
