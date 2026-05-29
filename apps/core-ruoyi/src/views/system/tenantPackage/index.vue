<script setup lang="ts">
import type { MenuTreeOption } from '@/api/modules/system/menu/types'
import type {
  TenantPkgQuery,
  TenantPkgVO,
} from '@/api/modules/system/tenantPackage/types'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import { tenantPackageMenuTreeselect } from '@/api/modules/system/menu'
import {
  addTenantPackage,
  changePackageStatus,
  delTenantPackage,
  getTenantPackage,
  listTenantPackage,
  updateTenantPackage,
} from '@/api/modules/system/tenantPackage'
import RightToolbar from '@/components/RuoYi/RightToolbar/index.vue'
import { download } from '@/utils/download'

defineOptions({
  name: 'TenantPackage',
})

const { confirm } = useFaModal()
const { success } = useFaToast()

const pagedList = ref<TenantPkgVO[]>([])
const buttonLoading = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const searchFold = ref(false)
const ids = ref<Array<string | number>>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const menuExpand = ref(false)
const menuNodeAll = ref(false)
const menuOptions = ref<MenuTreeOption[]>([])

const menuTreeRef = ref<ElTreeInstance>()
const queryFormRef = ref<ElFormInstance>()
const tenantPackageFormRef = ref<ElFormInstance>()

const dialog = reactive({
  visible: false,
  title: '',
})

const initForm = {
  packageId: undefined,
  packageName: '',
  menuIds: [],
  remark: '',
  menuCheckStrictly: true,
}

const form = reactive({ ...initForm })

const queryParams = reactive<TenantPkgQuery>({
  pageNum: 1,
  pageSize: 10,
  packageName: '',
})

const rules = {
  packageId: [
    { required: true, message: '租户套餐id不能为空', trigger: 'blur' },
  ],
  packageName: [
    { required: true, message: '套餐名称不能为空', trigger: 'blur' },
  ],
}

function getMenuAllCheckedKeys(): (string | number)[] | undefined {
  const checkedKeys = menuTreeRef.value?.getCheckedKeys()
  const halfCheckedKeys = menuTreeRef.value?.getHalfCheckedKeys()
  if (halfCheckedKeys) {
    checkedKeys?.unshift(...halfCheckedKeys)
  }
  return checkedKeys
}

async function getPackageMenuTreeselect(packageId: string | number) {
  const res = await tenantPackageMenuTreeselect(packageId)
  menuOptions.value = res.data.menus
}

async function getList() {
  loading.value = true
  try {
    const res = await listTenantPackage(queryParams)
    pagedList.value = res.rows
    total.value = res.total
  }
  finally {
    loading.value = false
  }
}

async function handleStatusChange(row: TenantPkgVO) {
  const text = row.status === '0' ? '启用' : '停用'
  try {
    await confirm({
      title: '系统提示',
      content: `确认要"${text}""${row.packageName}"套餐吗？`,
      type: 'warning',
    })
    await changePackageStatus(row.packageId, row.status)
    success(`${text}成功`)
  }
  catch {
    row.status = row.status === '0' ? '1' : '0'
  }
}

function cancel() {
  reset()
  dialog.visible = false
}

function reset() {
  menuTreeRef.value?.setCheckedKeys([])
  menuExpand.value = false
  menuNodeAll.value = false
  Object.assign(form, initForm)
  tenantPackageFormRef.value?.resetFields()
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryFormRef.value?.resetFields()
  handleQuery()
}

function handleSelectionChange(selection: TenantPkgVO[]) {
  ids.value = selection.map(item => item.packageId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleCheckedTreeExpand(value: boolean) {
  const treeList = menuOptions.value
  for (let i = 0; i < treeList.length; i++) {
    if (menuTreeRef.value) {
      menuTreeRef.value.store.nodesMap[treeList[i].id].expanded = value
    }
  }
}

function handleCheckedTreeNodeAll(value: boolean | string | number, type: string) {
  if (type === 'menu') {
    menuTreeRef.value?.setCheckedNodes(value ? (menuOptions.value as any) : [])
  }
}

function handleCheckedTreeConnect(value: boolean | string | number, type: string) {
  if (type === 'menu') {
    form.menuCheckStrictly = value as boolean
  }
}

async function handleAdd() {
  reset()
  await getPackageMenuTreeselect(0)
  dialog.visible = true
  dialog.title = '添加租户套餐'
}

async function handleUpdate(row?: TenantPkgVO) {
  reset()
  const _packageId = row?.packageId || ids.value[0]
  const response = await getTenantPackage(_packageId)
  Object.assign(form, response.data)
  const res = await getPackageMenuTreeselect(_packageId)
  dialog.visible = true
  dialog.title = '修改租户套餐'
  res.data.checkedKeys.forEach((v: any) => {
    nextTick(() => {
      menuTreeRef.value?.setChecked(v, true, false)
    })
  })
}

async function submitForm() {
  if (!tenantPackageFormRef.value) {
    return
  }
  const valid = await tenantPackageFormRef.value.validate().catch(() => false)
  if (!valid) {
    return
  }
  buttonLoading.value = true
  try {
    form.menuIds = getMenuAllCheckedKeys()
    if (form.packageId != null) {
      await updateTenantPackage(form)
    }
    else {
      await addTenantPackage(form)
    }
    success('操作成功')
    dialog.visible = false
    await getList()
  }
  finally {
    buttonLoading.value = false
  }
}

async function handleDelete(row?: TenantPkgVO) {
  const _packageIds = row?.packageId || ids.value
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认删除租户套餐编号为"${_packageIds}"的数据项？`,
      type: 'warning',
    })
    await delTenantPackage(_packageIds)
    success('删除成功')
    getList()
  }
  catch {
    // cancelled
  }
}

function handleExport() {
  download('/system/tenant/package/export', { ...queryParams }, `tenantPackage_${Date.now()}.xlsx`)
}

onMounted(() => {
  getList()
})
</script>

<template>
  <FaPageMain>
    <FaSearchBar v-model:fold="searchFold" :show-toggle="true" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="套餐名称" prop="packageName">
          <el-input
            v-model="queryParams.packageName"
            placeholder="请输入套餐名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><RefreshRight /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </FaSearchBar>

    <div class="my-4 flex items-center justify-between">
      <div class="flex gap-2">
        <FaButton v-auth="['system:tenantPackage:add']" @click="handleAdd">
          <FaIcon name="i-lucide:plus" class="mr-1" /> 新增
        </FaButton>
        <FaButton v-auth="['system:tenantPackage:edit']" variant="secondary" :disabled="single" @click="handleUpdate()">
          <FaIcon name="i-lucide:square-pen" class="mr-1" /> 修改
        </FaButton>
        <FaButton v-auth="['system:tenantPackage:remove']" variant="destructive" :disabled="multiple" @click="handleDelete()">
          <FaIcon name="i-lucide:trash-2" class="mr-1" /> 删除
        </FaButton>
        <FaButton v-auth="['system:tenantPackage:export']" variant="outline" @click="handleExport">
          <FaIcon name="i-lucide:download" class="mr-1" /> 导出
        </FaButton>
      </div>
      <RightToolbar
        v-model:show-search="showSearch"
        @query-table="getList"
      />
    </div>

    <el-table
      v-loading="loading"
      border
      :data="pagedList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        v-if="false"
        label="租户套餐id"
        align="center"
        prop="packageId"
      />
      <el-table-column label="套餐名称" align="center" prop="packageName" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button
              v-auth="['system:tenantPackage:edit']"
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
            />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button
              v-auth="['system:tenantPackage:remove']"
              link
              type="primary"
              icon="Delete"
              @click="handleDelete(scope.row)"
            />
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

    <!-- 添加或修改租户套餐对话框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      append-to-body
    >
      <el-form
        ref="tenantPackageFormRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="套餐名称" prop="packageName">
          <el-input v-model="form.packageName" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="关联菜单">
          <el-checkbox
            v-model="menuExpand"
            @change="handleCheckedTreeExpand($event)"
          >
            展开/折叠
          </el-checkbox>
          <el-checkbox
            v-model="menuNodeAll"
            @change="handleCheckedTreeNodeAll($event, 'menu')"
          >
            全选/全不选
          </el-checkbox>
          <el-checkbox
            v-model="form.menuCheckStrictly"
            @change="handleCheckedTreeConnect($event, 'menu')"
          >
            父子联动
          </el-checkbox>
          <el-tree
            ref="menuTreeRef"
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="加载中，请稍候"
            :props="{ label: 'label', children: 'children' } as any"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">
            确 定
          </el-button>
          <el-button @click="cancel">
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>
  </FaPageMain>
</template>
