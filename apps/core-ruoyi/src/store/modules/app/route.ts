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

    // 实际路由
    const routes = computed(() => {
      const returnRoutes: RouteRecordRaw[] = []
      if (routesRaw.value) {
        routesRaw.value.forEach((item) => {
          const tmpRoutes = cloneDeep(item.children) as any[]
          tmpRoutes.map((v) => {
            if (!v.meta) {
              v.meta = {}
            }
            v.meta.auth = item.meta?.auth ?? v.meta?.auth
            // 将相对路径转换为绝对路径
            if (v.path && !v.path.startsWith('/')) {
              v.path = resolveRoutePath(item.path, v.path)
            }
            return v
          })
          returnRoutes.push(...tmpRoutes as RouteRecordRaw[])
        })
        returnRoutes.forEach((item) => {
          if (item.children) {
            item.children = deleteMiddleRouteComponent(item.children)
          }
          return item
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
      routesRaw.value.forEach((route) => {
        if (route.children) {
          routes.push(...route.children)
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
                console.warn(`[路由] 视图文件不存在: ${viewPath}，路由: ${route.name}`)
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
    // 生成路由（后端获取）
    async function generateRoutesAtBack() {
      await apiApp.getRouters().then((res: any) => {
        try {
          // 设置 routes 数据
          routesRaw.value = sortAsyncRoutes(formatBackRoutes(res.data) as any)
          // 创建路由匹配器
          const routes: RouteRecordRaw[] = []
          routesRaw.value.forEach((route: any) => {
            if (route.children) {
              // 将子路由的相对路径转换为绝对路径
              route.children.forEach((child: any) => {
                if (child.path && !child.path.startsWith('/')) {
                  child.path = resolveRoutePath(route.path, child.path)
                }
              })
              routes.push(...route.children)
            }
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
