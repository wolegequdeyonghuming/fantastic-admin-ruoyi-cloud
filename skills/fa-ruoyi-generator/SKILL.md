---
name: fa-ruoyi-generator
description: "将若依（RuoYi）框架的页面迁移到 Fantastic-admin 框架，处理组件替换、API适配、类型转换等问题。适用于：迁移若依现有页面到 Fantastic-admin、批量转换若依模块、处理若依与 Fantastic-admin 的差异。"
---

# 若依页面迁移指南

将若依（RuoYi）框架的页面迁移到 Fantastic-admin 框架的完整指南。

---

## 迁移前准备

### 1. 确认目标应用

本项目是 monorepo 架构，`apps/` 目录下存放各应用。迁移前必须确认目标应用：

```bash
ls apps/
```

### 2. 若依页面结构分析

若依页面通常包含：
- `views/模块名/页面名/index.vue` — 主页面
- `api/模块名/页面名.js` — API（若依是 .js，FA 是 .ts）
- 可能包含子组件如 `DetailDialog.vue`

---

## 迁移检查清单

### 步骤 1：页面基础结构调整

| 检查项 | 若依原代码 | Fantastic-admin 修改 | 必要性 |
|--------|-----------|---------------------|--------|
| 页面标题 | `<FaPageMain title="xxx">` | 去掉 title 属性 | 必须 |
| 搜索栏边距 | `<FaSearchBar>` | 添加 `class="mb-4"` | 必须 |
| 按钮组件 | `FaButton` / 自定义按钮 | `el-button` | 必须 |
| 搜索/重置按钮图标 | `FaIcon` | `el-icon` + Element Plus 图标 | 可选 |

**修改示例：**
```vue
<!-- 修改前 -->
<FaPageMain title="在线用户">
  <FaSearchBar v-model:fold="searchFold" :show-toggle="true">
    <el-form-item>
      <FaButton type="primary" @click="handleQuery">
        <FaIcon name="i-lucide:search" class="mr-1" />
        搜索
      </FaButton>
    </el-form-item>
  </FaSearchBar>

<!-- 修改后 -->
<FaPageMain>
  <FaSearchBar v-model:fold="searchFold" :show-toggle="true" class="mb-4">
    <el-form-item>
      <el-button type="primary" @click="handleQuery">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
    </el-form-item>
  </FaSearchBar>
```

### 步骤 2：API 适配

#### 2.1 响应结构差异（关键）

| 框架 | 响应结构 | 获取数据方式 |
|------|---------|-------------|
| 若依原生 | `{code, msg, rows, total}` | 直接访问 `rows`/`total` |
| Fantastic-admin | `{data: {rows, total}}` | 解构 `const {data} = res` |

**问题：** 若依后端直接返回分页数据，不是嵌套在 `data` 中。

**解决方案：**

1. **添加 PageResponse 类型** (`types/ruoyi/common.d.ts`):
```typescript
/** 若依分页响应结构（直接返回，非嵌套在data中） */
export interface PageResponse<T> {
  code: number
  msg: string
  rows: T[]
  total: number
  totalSum?: number | null
}
```

2. **API 文件使用 PageResponse**:
```typescript
// 修改前
import type { PageResult } from '@/types/ruoyi/common'
return api.get<PageResult<OnlineVO>>('/monitor/online/list')

// 修改后
import type { PageResponse } from '@/types/ruoyi/common'
return api.get<PageResponse<OnlineVO>>('/monitor/online/list')
```

3. **页面中直接使用返回值**:
```typescript
// 修改前（假设有 data 嵌套）
const { data } = await list(queryParams)
list.value = data.rows

// 修改后（若依直接返回）
const data = await list(queryParams)
pagedList.value = data.rows
```

#### 2.2 API 命名冲突

**问题：** API 导入的 `list` 函数与变量名冲突。

**解决方案：**
```typescript
// 数据变量统一使用 pagedList
const pagedList = ref<OnlineVO[]>([])

// API 函数导入时保持原名
import { list } from '@/api/modules/monitor/online'

// 调用时不会有冲突
const data = await list(queryParams)
pagedList.value = data.rows
```

### 步骤 3：分页逻辑调整

**原则：使用后端分页，不做前端分页**

| 项目 | 若依做法 | FA 做法 |
|------|---------|---------|
| 分页计算 | 后端已分页 | 直接使用后端返回 |
| 数据变量 | `list` + `pagedList` computed | 仅用 `pagedList` ref |
| 表格绑定 | `:data="list"` | `:data="pagedList"` |

**修改示例：**
```typescript
// 修改前（若依可能有前端分页）
const list = ref<OnlineVO[]>([])
const pagedList = computed(() => {
  const start = (queryParams.pageNum - 1) * queryParams.pageSize
  return list.value.slice(start, start + queryParams.pageSize)
})

// 修改后（直接使用后端分页）
const pagedList = ref<OnlineVO[]>([])
const data = await list(queryParams)
pagedList.value = data.rows  // 直接赋值
```

### 步骤 4：组件替换映射

| 若依组件 | FA/Element Plus 替代 | 说明 |
|---------|---------------------|------|
| 自定义搜索按钮 | `el-button` | Element Plus 自带间距 |
| 自定义图标 | `el-icon` + `@element-plus/icons-vue` | 如 `<Search />` |
| 右侧工具栏 | `RightToolbar` (若依组件) | 可保留使用 |
| DictTag | `DictTag` (若依组件) | 可保留使用 |
| 分页组件 | `FaPagination` | 使用 FA 内置组件 |

### 步骤 5：导入语句调整

**必须添加的导入：**
```typescript
import { Search, RefreshRight } from '@element-plus/icons-vue'
```

**可选导入（根据页面功能）：**
```typescript
import type { ElFormInstance, ElTableInstance } from '#/element-plus'
```

---

## 常见问题与解决方案

### Q1: 表格数据不显示
**原因：** 响应结构不匹配，用了 `const {data} = await list()` 但若依直接返回数据。

**解决：** 改为 `const data = await list()`

### Q2: list 命名冲突
**原因：** API 函数 `list` 与数据变量 `list` 同名。

**解决：** 数据变量统一改为 `pagedList`

### Q3: 搜索栏和表格重叠
**原因：** `FaSearchBar` 没有底部间距。

**解决：** 添加 `class="mb-4"`

### Q4: 按钮没有间距
**原因：** 使用 `FaButton` 而不是 `el-button`。

**解决：** 搜索栏按钮统一使用 `el-button`，Element Plus 自带间距

### Q5: 缺少依赖
**原因：** 复制来的代码只有主要代码，主要是 views 文件夹下的，可能会缺少 api、types、components 等文件夹下的内容。

**解决：** 以表格形式输出缺少的文件路径，手动拷贝缺失的文件夹。

---

## 迁移流程模板

```bash
# 1. 拷贝若依页面
cp -r ruoyi-ui/src/views/monitor/xxx fantastic-admin/apps/core-ruoyi/src/views/monitor/

# 2. 修改页面基础结构
# - 去掉 FaPageMain 的 title
# - FaSearchBar 添加 mb-4
# - 按钮改为 el-button
# - 图标改为 el-icon

# 3. 修改 API 类型
# - types/ruoyi/common.d.ts 添加 PageResponse
# - API 文件使用 PageResponse<T>

# 4. 修改页面逻辑
# - 去掉前端分页 computed
# - pagedList 改为 ref
# - getList 中 const data = await list()

# 5. 验证运行
pnpm dev
```

---

## 文件修改速查表

| 文件类型 | 必须修改 | 修改内容 |
|---------|---------|---------|
| `views/**/*.vue` | 是 | 去掉 title, mb-4, el-button |
| `api/**/*.ts` | 是 | PageResult → PageResponse |
| `types/ruoyi/common.d.ts` | 是 | 添加 PageResponse 接口 |
| 子组件 | 否 | 视情况而定 |

---

## 最佳实践

1. **统一命名：** 数据列表变量统一用 `pagedList`，避免与 API 函数 `list` 冲突
2. **后端分页：** 信任后端分页，不做前端二次分页
3. **类型安全：** 使用 `PageResponse<T>` 确保响应类型正确
4. **组件选择：** 搜索栏按钮用 `el-button`，其他场景可考虑 `FaButton`
5. **间距处理：** `FaSearchBar` 必须加 `class="mb-4"` 避免重叠
