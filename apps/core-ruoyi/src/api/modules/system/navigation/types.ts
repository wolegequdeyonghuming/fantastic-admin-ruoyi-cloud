export interface NavigationVO {
  /**
   * 导航ID
   */
  id: string | number

  /**
   * 导航名称
   */
  navName: string

  /**
   * 导航标识
   */
  navKey: string

  /**
   * 导航图标
   */
  navIcon: string

  /**
   * 导航跳转地址
   */
  navUrl: string

  /**
   * 显示顺序
   */
  navSort: number

  /**
   * 状态（0正常 1停用）
   */
  status: string

  /**
   * 是否外链（0否 1是）
   */
  isFrame: string

  /**
   * 创建时间
   */
  createTime: string

  /**
   * 备注
   */
  remark: string
}

export interface NavigationForm {
  /**
   * 导航ID
   */
  id?: string | number

  /**
   * 导航名称
   */
  navName: string

  /**
   * 导航标识
   */
  navKey: string

  /**
   * 导航图标
   */
  navIcon?: string

  /**
   * 导航跳转地址
   */
  navUrl?: string

  /**
   * 显示顺序
   */
  navSort: number

  /**
   * 状态（0正常 1停用）
   */
  status?: string

  /**
   * 是否外链（0否 1是）
   */
  isFrame?: string

  /**
   * 备注
   */
  remark?: string
}

export interface NavigationQuery extends PageQuery {
  /**
   * 导航名称
   */
  navName?: string

  /**
   * 导航标识
   */
  navKey?: string

  /**
   * 状态
   */
  status?: string
}

// ==================== 导航菜单类型 ====================

export interface NavigationMenuVO {
  /**
   * 菜单ID
   */
  id: string | number

  /**
   * 导航ID
   */
  navigationId: string | number

  /**
   * 菜单名称
   */
  menuName: string

  /**
   * 菜单描述
   */
  menuDesc: string

  /**
   * 菜单图标
   */
  menuIcon: string

  /**
   * 图标颜色（渐变色）
   */
  menuColor: string

  /**
   * 菜单链接
   */
  menuUrl: string

  /**
   * 显示顺序
   */
  menuSort: number

  /**
   * 状态（0正常 1停用）
   */
  status: string

  /**
   * 是否外链（0否 1是）
   */
  isFrame: string

  /**
   * 创建时间
   */
  createTime: string

  /**
   * 备注
   */
  remark: string
}

export interface NavigationMenuForm {
  /**
   * 菜单ID
   */
  id?: string | number

  /**
   * 导航ID
   */
  navigationId: string | number

  /**
   * 菜单名称
   */
  menuName: string

  /**
   * 菜单描述
   */
  menuDesc?: string

  /**
   * 菜单图标
   */
  menuIcon?: string

  /**
   * 图标颜色（渐变色）
   */
  menuColor?: string

  /**
   * 菜单链接
   */
  menuUrl?: string

  /**
   * 显示顺序
   */
  menuSort: number

  /**
   * 状态（0正常 1停用）
   */
  status?: string

  /**
   * 是否外链（0否 1是）
   */
  isFrame?: string

  /**
   * 备注
   */
  remark?: string
}
