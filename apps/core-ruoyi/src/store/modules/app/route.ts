import type { RouteRecordMainRaw } from '@fantastic-admin/types'
import type { RouteRecordRaw, RouterMatcher } from 'vue-router'
import { cloneDeep } from 'es-toolkit'
import { createRouterMatcher } from 'vue-router'
import apiApp from '@/api/modules/app'
import { systemRoutes as systemRoutesRaw } from '@/router/routes'

export const useAppRouteStore = defineStore(
  'appRoute',
  () => {
    const isGenerate = ref(false)
    // 原始路由
    const routesRaw = ref<RouteRecordMainRaw[]>([])
    // 已注册的路由，用于登出时删除路由
    const currentRemoveRoutes = ref<(() => void)[]>([])

    // 递归处理所有子路由的 path，将相对路径转换为绝对路径
    function resolveChildrenPathInRoutes(children: any[], parentPath: string) {
      children.forEach((child: any) => {
        if (child.path && !child.path.startsWith('/')) {
          child.path = resolveRoutePath(parentPath, child.path)
        }
        // 递归处理孙子路由及更深层级
        if (child.children && child.children.length > 0) {
          resolveChildrenPathInRoutes(child.children, child.path)
        }
      })
    }

    // 实际路由
    const routes = computed(() => {
      const returnRoutes: RouteRecordRaw[] = []
      if (routesRaw.value) {
        routesRaw.value.forEach((item) => {
          const routeItem = item as unknown as RouteRecordRaw

          // 跳过外链路由（不注册到 Vue Router）
          if (routeItem.meta?.link || /^https?:/.test(routeItem.path)) {
            return
          }

          // 复制父级路由（包含 Layout 组件）
          const parentRoute: any = {
            path: routeItem.path,
            name: routeItem.name,
            component: routeItem.component,
            meta: { ...routeItem.meta },
          }

          // 条件添加 redirect（如果存在）
          if (routeItem.redirect) {
            parentRoute.redirect = routeItem.redirect
          }

          // 处理子路由
          if (routeItem.children) {
            // 过滤外链子路由
            parentRoute.children = routeItem.children
              .filter((child: any) => {
                return !(child.meta?.link || /^https?:/.test(child.path))
              })
              .map((child) => {
                const newRoute = { ...child } as RouteRecordRaw
                // 显式保留 component 函数（cloneDeep 会丢失它）
                if (child.component) {
                  newRoute.component = child.component as any
                }
                // 处理 meta
                if (!newRoute.meta) {
                  newRoute.meta = {}
                }
                newRoute.meta.auth = routeItem.meta?.auth ?? newRoute.meta?.auth
                // 将相对路径转换为绝对路径
                if (newRoute.path && !newRoute.path.startsWith('/')) {
                  newRoute.path = resolveRoutePath(routeItem.path, newRoute.path)
                }
                // 递归处理孙子路由及更深层级
                if (newRoute.children && newRoute.children.length > 0) {
                  resolveChildrenPathInRoutes(newRoute.children, newRoute.path)
                }
                // 深拷贝嵌套的 children（它们没有 component 函数）
                if (child.children) {
                  newRoute.children = cloneDeep(child.children)
                }
                return newRoute
              })

            // 删除中间层级的组件（保持框架原有逻辑）
            if (parentRoute.children.length > 0) {
              parentRoute.children = deleteMiddleRouteComponent(parentRoute.children)
            }
          }

          returnRoutes.push(parentRoute)
        })
      }
      return returnRoutes
    })
    // 系统路由
    const systemRoutes = computed(() => {
      const routes = [...systemRoutesRaw]
      routes.forEach((item) => {
        if (item.children) {
          item.children = deleteMiddleRouteComponent(item.children)
        }
      })
      return routes
    })
    // 拼接路径，将相对路径转换为绝对路径
    function resolveRoutePath(basePath?: string, routePath?: string): string {
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

    // 删除路由中间层级对应的组件
    function deleteMiddleRouteComponent(routes: RouteRecordRaw[]) {
      const res: RouteRecordRaw[] = []
      routes.forEach((route) => {
        if (route.children?.length) {
          delete route.component
          route.children = deleteMiddleRouteComponent(route.children)
        }
        else {
          delete route.children
        }
        res.push(route)
      })
      return res
    }

    // 路由匹配器
    const routesMatcher = ref<RouterMatcher>()
    // 根据路径获取匹配的路由
    function getRouteMatchedByPath(path: string) {
      return routesMatcher.value?.resolve({ path }, undefined!)?.matched ?? []
    }

    // 路由排序，sort 越大越靠前
    function sortAsyncRoutes<T extends RouteRecordMainRaw[] | RouteRecordRaw[]>(routes: T): T {
      routes.sort((a, b) => (b.meta?.sort ?? 0) - (a.meta?.sort ?? 0))
      routes.forEach((route) => {
        if (route.children) {
          route.children = sortAsyncRoutes(route.children)
        }
      })
      return routes
    }

    // 生成路由（前端生成）
    function generateRoutesAtFront(asyncRoutes: RouteRecordMainRaw[]) {
      // 设置 routes 数据
      routesRaw.value = sortAsyncRoutes(cloneDeep(asyncRoutes) as any)
      // 创建路由匹配器
      const routes: RouteRecordRaw[] = []
      routesRaw.value.forEach((route: any) => {
        // 跳过外链路由（不注册到 Vue Router）
        if (route.meta?.link || /^https?:/.test(route.path)) {
          return
        }
        if (route.children) {
          // 过滤外链子路由
          const filteredChildren = route.children.filter((child: any) => {
            return !(child.meta?.link || /^https?:/.test(child.path))
          })
          routes.push(...filteredChildren)
        }
      })
      routesMatcher.value = createRouterMatcher(routes, {})
      isGenerate.value = true
    }
    // 格式化后端路由数据（适配若依 RuoYi 路由格式）
    function formatBackRoutes(routes: any, views = import.meta.glob('@/views/**/*.vue')): RouteRecordMainRaw[] {
      return routes.map((route: any) => {
        // 初始化 meta 对象
        if (!route.meta) {
          route.meta = {}
        }

        // 处理 hidden 字段 -> meta.menu
        if (route.hidden === true) {
          route.meta.menu = false
        }

        // 处理 meta.noCache -> meta.keepAlive（取反逻辑）
        if (route.meta.noCache === false) {
          route.meta.keepAlive = true
        }

        // 处理 activeMenu（若依已提供，无需额外处理）
        // route.meta.activeMenu 保持原值即可

        // 处理 alwaysShow
        if (route.alwaysShow !== undefined) {
          route.meta.alwaysShow = route.alwaysShow
        }

        // 处理 redirect: noRedirect -> 移除 redirect
        if (route.redirect === 'noRedirect') {
          delete route.redirect
        }

        // 处理外链（若依通过 meta.link 或 path 以 http/https 开头标识外链）
        if (route.meta?.link || /^https?:/.test(route.path)) {
          route.meta.link = route.meta?.link || route.path
          // 外链路由不需要注册到 Vue Router，通过 meta.menu = false 隐藏
          route.meta.menu = false
        }

        // 处理组件映射
        switch (route.component) {
          case 'Layout':
            route.component = () => import('@/layouts/index.vue')
            break
          case 'ParentView':
            // 中间层级组件，在 deleteMiddleRouteComponent 中会被删除
            delete route.component
            break
          default:
            if (route.component) {
              const viewPath = `/src/views/${route.component}.vue`
              const viewComponent = views[viewPath]
              if (viewComponent) {
                route.component = viewComponent
              }
              else {
                // 创建占位组件，避免路由失效导致循环
                const missingViewPath = route.component
                const missingRouteName = route.name
                route.component = () => Promise.resolve({
                  default: {
                    name: `Placeholder_${missingRouteName}`,
                    template: `
                      <div style="padding: 40px; text-align: center;">
                        <h2>页面开发中</h2>
                        <p>视图文件不存在: {{ viewPath }}</p>
                        <p>路由名称: {{ routeName }}</p>
                      </div>
                    `,
                    setup() {
                      return {
                        viewPath: missingViewPath,
                        routeName: missingRouteName,
                      }
                    },
                  },
                })
              }
            }
            else {
              delete route.component
            }
        }

        // 递归处理子路由
        if (route.children) {
          route.children = formatBackRoutes(route.children, views)
        }

        return route
      })
    }
    // 递归处理所有子路由的 path，将相对路径转换为绝对路径
    function resolveChildrenPath(children: any[], parentPath: string) {
      children.forEach((child: any) => {
        if (child.path && !child.path.startsWith('/')) {
          child.path = resolveRoutePath(parentPath, child.path)
        }
        // 递归处理孙子路由及更深层级
        if (child.children && child.children.length > 0) {
          resolveChildrenPath(child.children, child.path)
        }
      })
    }

    // 生成路由（后端获取）
    async function generateRoutesAtBack() {
      await apiApp.getRouters().then((res: any) => {
        try {
          // 设置 routes 数据
          routesRaw.value = sortAsyncRoutes(formatBackRoutes(res.data) as any)
          // 创建路由匹配器
          const routes: RouteRecordRaw[] = []
          routesRaw.value.forEach((route: any) => {
            // 跳过外链路由（不注册到 Vue Router）
            if (route.meta?.link || /^https?:/.test(route.path)) {
              return
            }
            if (route.children) {
              // 将子路由的相对路径转换为绝对路径，并过滤外链
              route.children = route.children.filter((child: any) => {
                // 跳过外链子路由
                if (child.meta?.link || /^https?:/.test(child.path)) {
                  return false
                }
                return true
              })
              route.children.forEach((child: any) => {
                if (child.path && !child.path.startsWith('/')) {
                  child.path = resolveRoutePath(route.path, child.path)
                }
                // 处理孙子路由及更深层级
                if (child.children && child.children.length > 0) {
                  resolveChildrenPath(child.children, child.path)
                }
              })
            }
            // 推送完整的路由对象（包含 Layout 组件包裹子路由）
            routes.push(route)
          })
          routesMatcher.value = createRouterMatcher(routes, {})
        }
        catch (error) {
          console.error('[路由] 获取路由数据失败:', error)
        }
        isGenerate.value = true
      })
    }
    function setCurrentRemoveRoutes(routes: (() => void)[]) {
      currentRemoveRoutes.value = routes
    }
    // 清空动态路由
    function removeRoutes() {
      isGenerate.value = false
      routesRaw.value = []
      currentRemoveRoutes.value.forEach((removeRoute) => {
        removeRoute()
      })
      currentRemoveRoutes.value = []
    }

    return {
      isGenerate,
      routesRaw,
      currentRemoveRoutes,
      routes,
      systemRoutes,
      getRouteMatchedByPath,
      generateRoutesAtFront,
      generateRoutesAtBack,
      setCurrentRemoveRoutes,
      removeRoutes,
    }
  },
)
