<script setup lang="ts">
import type { NavigationForm, NavigationMenuForm, NavigationMenuVO, NavigationQuery, NavigationVO } from '@/api/modules/system/navigation/types'
import dayjs from 'dayjs'
import { addNavigation, addNavigationMenu, delNavigation, delNavigationMenu, getNavigation, getNavigationMenu, listNavigation, listNavigationMenu, updateNavigation, updateNavigationMenu } from '@/api/modules/system/navigation'

defineOptions({ name: 'Navigation' })

const { success: toastSuccess } = useFaToast()
const { confirm } = useFaModal()

const { proxy } = getCurrentInstance() as ComponentInternalInstance

const navigationList = ref<NavigationVO[]>([])
const loading = ref(true)
const showSearch = ref(true)
const searchFold = ref(false)
const ids = ref<Array<number | string>>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)

const queryFormRef = ref<ElFormInstance>()
const navigationFormRef = ref<ElFormInstance>()

const dialog = reactive<DialogOption>({
  visible: false,
  title: '',
})

const initFormData: NavigationForm = {
  id: undefined,
  navName: '',
  navKey: '',
  navIcon: '',
  navUrl: '',
  navSort: 0,
  status: '0',
  isFrame: '0',
  remark: '',
}

const data = reactive<PageData<NavigationForm, NavigationQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    navName: '',
    navKey: '',
    status: '',
  },
  rules: {
    navName: [{ required: true, message: '导航名称不能为空', trigger: 'blur' }],
    navKey: [{ required: true, message: '导航标识不能为空', trigger: 'blur' }],
    navSort: [{ required: true, message: '显示顺序不能为空', trigger: 'blur' }],
  },
})

const { queryParams, form, rules } = toRefs(data)

// ==================== 菜单管理相关 ====================
const menuDialog = reactive<DialogOption>({
  visible: false,
  title: '',
})

const menuFormDialog = reactive<DialogOption>({
  visible: false,
  title: '',
})

const menuList = ref<NavigationMenuVO[]>([])
const menuLoading = ref(false)
const currentNavigationId = ref<number | string>()

const menuFormRef = ref<ElFormInstance>()

const initMenuFormData: NavigationMenuForm = {
  id: undefined,
  navigationId: 0,
  menuName: '',
  menuDesc: '',
  menuIcon: '',
  menuColor: '',
  menuUrl: '',
  menuSort: 0,
  status: '0',
  isFrame: '0',
  remark: '',
}

const menuForm = ref<NavigationMenuForm>({ ...initMenuFormData })

const menuRules = reactive({
  menuName: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
  menuSort: [{ required: true, message: '显示顺序不能为空', trigger: 'blur' }],
})

/** 查询导航列表 */
async function getList() {
  loading.value = true
  const res = await listNavigation(queryParams.value)
  navigationList.value = res.data
  total.value = res.data.length
  loading.value = false
}

/** 取消按钮 */
function cancel() {
  reset()
  dialog.visible = false
}

/** 表单重置 */
function reset() {
  form.value = { ...initFormData }
  navigationFormRef.value?.resetFields()
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: NavigationVO[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  dialog.visible = true
  dialog.title = '添加导航'
}

/** 修改按钮操作 */
async function handleUpdate(row?: NavigationVO) {
  reset()
  const id = row?.id || ids.value[0]
  const res = await getNavigation(id)
  Object.assign(form.value, res.data)
  dialog.visible = true
  dialog.title = '修改导航'
}

/** 提交按钮 */
function submitForm() {
  navigationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.id) {
        await updateNavigation(form.value)
        toastSuccess('修改成功')
      }
      else {
        await addNavigation(form.value)
        toastSuccess('新增成功')
      }
      dialog.visible = false
      await getList()
    }
  })
}

/** 删除按钮操作 */
async function handleDelete(row?: NavigationVO) {
  const idList = row?.id || ids.value
  await confirm({ title: '系统提示', content: `是否确认删除导航编号为"${idList}"的数据项？`, type: 'warning' })
  await delNavigation(idList)
  await getList()
  toastSuccess('删除成功')
}

// ==================== 菜单管理功能 ====================

/** 菜单管理按钮 */
async function handleMenu(row: NavigationVO) {
  currentNavigationId.value = row.id
  menuDialog.visible = true
  menuDialog.title = `"${row.navName}" 菜单管理`
  await getMenuList(row.id)
}

/** 查询菜单列表 */
async function getMenuList(navigationId: number | string) {
  menuLoading.value = true
  const res = await listNavigationMenu(navigationId)
  menuList.value = res.data
  menuLoading.value = false
}

/** 新增菜单按钮 */
function handleAddMenu() {
  resetMenu()
  menuForm.value.navigationId = currentNavigationId.value as number
  menuFormDialog.visible = true
  menuFormDialog.title = '添加菜单'
}

/** 修改菜单按钮 */
async function handleUpdateMenu(row: NavigationMenuVO) {
  resetMenu()
  const res = await getNavigationMenu(row.id)
  Object.assign(menuForm.value, res.data)
  menuFormDialog.visible = true
  menuFormDialog.title = '修改菜单'
}

/** 删除菜单按钮 */
async function handleDeleteMenu(row: NavigationMenuVO) {
  await confirm({ title: '系统提示', content: `是否确认删除菜单"${row.menuName}"？`, type: 'warning' })
  await delNavigationMenu(row.id)
  await getMenuList(currentNavigationId.value as number)
  toastSuccess('删除成功')
}

/** 提交菜单表单 */
function submitMenuForm() {
  menuFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (menuForm.value.id) {
        await updateNavigationMenu(menuForm.value)
        toastSuccess('修改成功')
      }
      else {
        await addNavigationMenu(menuForm.value)
        toastSuccess('新增成功')
      }
      menuFormDialog.visible = false
      await getMenuList(currentNavigationId.value as number)
    }
  })
}

/** 取消菜单按钮 */
function cancelMenu() {
  resetMenu()
  menuFormDialog.visible = false
}

/** 菜单表单重置 */
function resetMenu() {
  menuForm.value = { ...initMenuFormData }
  menuFormRef.value?.resetFields()
}

// 初始化
getList()
</script>

<template>
  <FaPageMain>
    <!-- 搜索区域 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <FaSearchBar v-model:fold="searchFold" :show-toggle="true">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="导航名称" prop="navName">
              <el-input v-model="queryParams.navName" placeholder="请输入导航名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="导航标识" prop="navKey">
              <el-input v-model="queryParams.navKey" placeholder="请输入导航标识" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="导航状态" clearable>
                <el-option label="正常" value="0" />
                <el-option label="停用" value="1" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">
                搜索
              </el-button>
              <el-button icon="Refresh" @click="resetQuery">
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </FaSearchBar>
      </div>
    </transition>

    <!-- 导航列表 -->
    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="navigationList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="导航ID" align="center" prop="id" width="80" />
        <el-table-column label="导航名称" align="center" prop="navName" />
        <el-table-column label="导航标识" align="center" prop="navKey" />
        <el-table-column label="导航图标" align="center" prop="navIcon" width="100">
          <template #default="scope">
            <i :class="scope.row.navIcon" style="font-size: 20px;" />
          </template>
        </el-table-column>
        <el-table-column label="跳转地址" align="center" prop="navUrl" :show-overflow-tooltip="true">
          <template #default="scope">
            <span v-if="scope.row.navUrl">{{ scope.row.navUrl }}</span>
            <span v-else style="color: #909399;">未配置</span>
          </template>
        </el-table-column>
        <el-table-column label="是否外链" align="center" prop="isFrame" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isFrame === '1' ? 'warning' : 'info'" size="small">
              {{ scope.row.isFrame === '1' ? '外链' : '内部' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="显示顺序" align="center" prop="navSort" width="100" />
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">
              {{ scope.row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ dayjs(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
            <el-tooltip content="菜单管理" placement="top">
              <el-button link type="success" icon="Menu" @click="handleMenu(scope.row)">
                菜单
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <FaPagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:size="queryParams.pageSize"
        :total="total"
        class="mt-4"
        @page-change="getList"
        @size-change="getList"
      />
    </el-card>

    <!-- 添加或修改导航对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="600px" append-to-body>
      <el-form ref="navigationFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="导航名称" prop="navName">
          <el-input v-model="form.navName" placeholder="请输入导航名称" />
        </el-form-item>
        <el-form-item label="导航标识" prop="navKey">
          <el-input v-model="form.navKey" placeholder="请输入导航标识（英文）" />
        </el-form-item>
        <el-form-item label="导航图标" prop="navIcon">
          <el-input v-model="form.navIcon" placeholder="请输入图标类名，如：i-ep-coin">
            <template #prepend>
              <i :class="form.navIcon" style="font-size: 18px;" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="跳转地址" prop="navUrl">
          <el-input v-model="form.navUrl" placeholder="请输入跳转地址（选填）" />
        </el-form-item>
        <el-form-item label="是否外链" prop="isFrame">
          <el-radio-group v-model="form.isFrame">
            <el-radio value="0">
              否
            </el-radio>
            <el-radio value="1">
              是
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="显示顺序" prop="navSort">
          <el-input-number v-model="form.navSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="0">
              正常
            </el-radio>
            <el-radio value="1">
              停用
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">
            确 定
          </el-button>
          <el-button @click="cancel">
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 菜单管理对话框 -->
    <el-dialog v-model="menuDialog.visible" :title="menuDialog.title" width="80%" append-to-body>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="Plus" size="small" @click="handleAddMenu">
            新增菜单
          </el-button>
        </el-col>
      </el-row>

      <el-table v-loading="menuLoading" border :data="menuList">
        <el-table-column label="菜单ID" align="center" prop="id" width="80" />
        <el-table-column label="菜单名称" align="center" prop="menuName" />
        <el-table-column label="菜单描述" align="center" prop="menuDesc" :show-overflow-tooltip="true" />
        <el-table-column label="菜单图标" align="center" prop="menuIcon" width="100">
          <template #default="scope">
            <i :class="scope.row.menuIcon" style="font-size: 20px;" />
          </template>
        </el-table-column>
        <el-table-column label="图标颜色" align="center" prop="menuColor" width="150">
          <template #default="scope">
            <div :style="{ background: scope.row.menuColor, width: '100px', height: '20px', margin: '0 auto', borderRadius: '4px' }" />
          </template>
        </el-table-column>
        <el-table-column label="菜单链接" align="center" prop="menuUrl" :show-overflow-tooltip="true">
          <template #default="scope">
            <span v-if="scope.row.menuUrl">{{ scope.row.menuUrl }}</span>
            <span v-else style="color: #909399;">未配置</span>
          </template>
        </el-table-column>
        <el-table-column label="是否外链" align="center" prop="isFrame" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isFrame === '1' ? 'warning' : 'info'" size="small">
              {{ scope.row.isFrame === '1' ? '外链' : '内部' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="显示顺序" align="center" prop="menuSort" width="100" />
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'" size="small">
              {{ scope.row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdateMenu(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click="handleDeleteMenu(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog v-model="menuFormDialog.visible" :title="menuFormDialog.title" width="600px" append-to-body>
      <el-form ref="menuFormRef" :model="menuForm" :rules="menuRules" label-width="100px">
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="menuForm.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单描述" prop="menuDesc">
          <el-input v-model="menuForm.menuDesc" placeholder="请输入菜单描述" />
        </el-form-item>
        <el-form-item label="菜单图标" prop="menuIcon">
          <el-input v-model="menuForm.menuIcon" placeholder="请输入图标类名，如：i-ep-wallet">
            <template #prepend>
              <i :class="menuForm.menuIcon" style="font-size: 18px;" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="图标颜色" prop="menuColor">
          <el-input v-model="menuForm.menuColor" placeholder="请输入渐变色，如：linear-gradient(135deg, #667eea 0%, #764ba2 100%)" />
          <div v-if="menuForm.menuColor" :style="{ background: menuForm.menuColor, width: '100%', height: '30px', marginTop: '10px', borderRadius: '4px' }" />
        </el-form-item>
        <el-form-item label="菜单链接" prop="menuUrl">
          <el-input v-model="menuForm.menuUrl" placeholder="请输入菜单链接（选填）" />
        </el-form-item>
        <el-form-item label="是否外链" prop="isFrame">
          <el-radio-group v-model="menuForm.isFrame">
            <el-radio value="0">
              否
            </el-radio>
            <el-radio value="1">
              是
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="显示顺序" prop="menuSort">
          <el-input-number v-model="menuForm.menuSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="menuForm.status">
            <el-radio value="0">
              正常
            </el-radio>
            <el-radio value="1">
              停用
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="menuForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitMenuForm">
            确 定
          </el-button>
          <el-button @click="cancelMenu">
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>
  </FaPageMain>
</template>
