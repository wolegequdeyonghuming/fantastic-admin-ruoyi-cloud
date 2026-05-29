<script setup lang="ts">
import type { DeptTreeOption, RoleForm, RoleQuery, RoleVO } from '@/api/modules/system/role/types'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import {
  changeRoleStatus,
  dataScope,
  delRole,
  deptTreeSelect,
  getRole,
  listRole,
} from '@/api/modules/system/role'
import RightToolbar from '@/components/RuoYi/RightToolbar/index.vue'
import { useDict } from '@/composables/useDict'
import { download } from '@/utils/download'
import PermissionDialogVisible from './dialog/permissions.vue'

defineOptions({
  name: 'Role',
})

const { confirm } = useFaModal()
const { success } = useFaToast()
const { getDictOptions, parseTime } = useDict()

const sysNormalDisableOptions = getDictOptions('sys_normal_disable')

const pagedList = ref<RoleVO[]>([])
const loading = ref(true)
const showSearch = ref(true)
const searchFold = ref(false)
const ids = ref<Array<string | number>>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const dateRange = ref<[string, string]>(['', ''])
const deptExpand = ref(true)
const deptNodeAll = ref(false)
const deptOptions = ref<DeptTreeOption[]>([])
const openDataScope = ref(false)

const dataScopeOptions = ref([
  { value: '1', label: '全部数据权限' },
  { value: '2', label: '自定数据权限' },
  { value: '3', label: '本部门数据权限' },
  { value: '4', label: '本部门及以下数据权限' },
  { value: '5', label: '仅本人数据权限' },
  { value: '6', label: '部门及以下或本人数据权限' },
])

const queryFormRef = ref<ElFormInstance>()
const dataScopeRef = ref<ElFormInstance>()
const deptRef = ref<ElTreeInstance>()

const initForm: RoleForm = {
  roleId: undefined,
  roleSort: 1,
  status: '0',
  roleName: '',
  roleKey: '',
  menuCheckStrictly: true,
  deptCheckStrictly: true,
  remark: '',
  dataScope: '1',
  menuIds: [],
  deptIds: [],
}

const dialog = reactive({
  visible: false,
  title: '',
})

const form = reactive<RoleForm>({ ...initForm })

const queryParams = reactive<RoleQuery>({
  pageNum: 1,
  pageSize: 10,
  roleName: '',
  roleKey: '',
  status: '',
})
const router = useRouter()

const permissionDialog = ref(false)
const permissionRowData = ref<RoleVO | null>(null)
const selectValue = ref<RoleVO | null>(null)

function handleAuthMenu(row: RoleVO) {
  permissionRowData.value = { ...row }
  permissionDialog.value = true
}

function handleAuthMenuCheck() {
  permissionRowData.value = selectValue.value
  permissionDialog.value = true
}

function handleClose(val: boolean) {
  if (val) {
    getList()
  }
  permissionDialog.value = false
}

async function getList() {
  loading.value = true
  try {
    const params = {
      ...queryParams,
      params: { beginTime: dateRange.value[0], endTime: dateRange.value[1] },
    }
    const res = await listRole(params)
    pagedList.value = res.rows
    total.value = res.total
  }
  finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  dateRange.value = ['', '']
  queryFormRef.value?.resetFields()
  handleQuery()
}

async function handleDelete(row?: RoleVO) {
  const roleids = row?.roleId || ids.value
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认删除角色编号为"${roleids}"的数据项？`,
      type: 'warning',
    })
    await delRole(roleids)
    success('删除成功')
    getList()
  }
  catch {
    // 用户取消
  }
}

function handleExport() {
  download('/system/role/export', { ...queryParams }, `role_${Date.now()}.xlsx`)
}

function handleSelectionChange(selection: RoleVO[]) {
  selectValue.value = selection[0]
  ids.value = selection.map((item: RoleVO) => item.roleId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

async function handleStatusChange(row: RoleVO) {
  const text = row.status === '0' ? '启用' : '停用'
  try {
    await confirm({
      title: '系统提示',
      content: `确认要"${text}""${row.roleName}"角色吗?`,
      type: 'warning',
    })
    await changeRoleStatus(row.roleId, row.status)
    success(`${text}成功`)
  }
  catch {
    row.status = row.status === '0' ? '1' : '0'
  }
}

function handleAuthUser(row: RoleVO) {
  router.push(`/system/role-auth/user/${row.roleId}`)
}

function getDeptAllCheckedKeys(): (string | number)[] | undefined {
  const checkedKeys = deptRef.value?.getCheckedKeys()
  const halfCheckedKeys = deptRef.value?.getHalfCheckedKeys()
  if (halfCheckedKeys) {
    checkedKeys?.unshift(...halfCheckedKeys)
  }
  return checkedKeys
}

function handleAdd() {
  permissionRowData.value = null
  permissionDialog.value = true
}

async function getRoleDeptTreeSelect(roleId: string | number) {
  const res = await deptTreeSelect(roleId)
  deptOptions.value = res.data.depts
  return res.data
}

function handleCheckedTreeExpand(value: boolean | string | number, _type?: string) {
  const treeList = deptOptions.value
  for (let i = 0; i < treeList.length; i++) {
    if (deptRef.value) {
      deptRef.value.store.nodesMap[treeList[i].id].expanded = value as boolean
    }
  }
}

function handleCheckedTreeNodeAll(value: boolean | string | number, _type?: string) {
  deptRef.value?.setCheckedNodes(value ? (deptOptions.value as any) : [])
}

function handleCheckedTreeConnect(value: boolean | string | number, _type?: string) {
  form.deptCheckStrictly = value as boolean
}

function dataScopeSelectChange(value: string) {
  if (value !== '2') {
    deptRef.value?.setCheckedKeys([])
  }
}

async function handleDataScope(row: RoleVO) {
  const response = await getRole(row.roleId)
  Object.assign(form, response.data)
  const res = await getRoleDeptTreeSelect(row.roleId)
  openDataScope.value = true
  dialog.title = '分配数据权限'
  await nextTick(() => {
    deptRef.value?.setCheckedKeys(res.checkedKeys)
  })
}

async function submitDataScope() {
  if (form.roleId) {
    form.deptIds = getDeptAllCheckedKeys()
    await dataScope(form)
    success('修改成功')
    openDataScope.value = false
    getList()
  }
}

function cancelDataScope() {
  dataScopeRef.value?.resetFields()
  Object.assign(form, initForm)
  openDataScope.value = false
}

onMounted(() => {
  getList()
})
</script>

<template>
  <FaPageMain>
    <FaSearchBar v-model:fold="searchFold" :show-toggle="true" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="角色名称" prop="roleName">
          <el-input
            v-model="queryParams.roleName"
            placeholder="请输入角色名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="权限字符" prop="roleKey">
          <el-input
            v-model="queryParams.roleKey"
            placeholder="请输入权限字符"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="角色状态"
            clearable
          >
            <el-option
              v-for="dict in sysNormalDisableOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" style="width: 308px;">
          <el-date-picker
            v-model="dateRange"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="[
              new Date(2000, 1, 1, 0, 0, 0),
              new Date(2000, 1, 1, 23, 59, 59),
            ]"
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
        <FaButton v-hasPermi="['system:role:add']" @click="handleAdd()">
          <FaIcon name="i-lucide:plus" class="mr-1" /> 新增
        </FaButton>
        <FaButton v-hasPermi="['system:role:edit']" variant="secondary" :disabled="single" @click="handleAuthMenuCheck()">
          <FaIcon name="i-lucide:edit" class="mr-1" /> 修改
        </FaButton>
        <FaButton v-hasPermi="['system:role:delete']" variant="destructive" :disabled="ids.length === 0" @click="handleDelete()">
          <FaIcon name="i-lucide:trash-2" class="mr-1" /> 删除
        </FaButton>
        <FaButton v-hasPermi="['system:role:export']" variant="outline" @click="handleExport">
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
        label="角色编号"
        prop="roleId"
        width="120"
      />
      <el-table-column
        label="角色名称"
        prop="roleName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="权限字符"
        prop="roleKey"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="显示顺序" prop="roleSort" width="120" />
      <el-table-column label="状态" align="center" width="120">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column fixed="right" label="操作" width="200">
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button
              v-hasPermi="['system:role:edit']"
              link
              type="primary"
              icon="Edit"
              @click="handleAuthMenu(scope.row)"
            />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button
              v-hasPermi="['system:role:remove']"
              link
              type="primary"
              icon="Delete"
              @click="handleDelete(scope.row)"
            />
          </el-tooltip>
          <el-tooltip content="数据权限" placement="top">
            <el-button
              v-hasPermi="['system:role:edit']"
              link
              type="primary"
              icon="CircleCheck"
              @click="handleDataScope(scope.row)"
            />
          </el-tooltip>
          <el-tooltip content="分配用户" placement="top">
            <el-button
              v-hasPermi="['system:role:edit']"
              link
              type="primary"
              icon="User"
              @click="handleAuthUser(scope.row)"
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

    <!-- 分配角色数据权限对话框 -->
    <el-dialog
      v-model="openDataScope"
      :title="dialog.title"
      width="500px"
      append-to-body
    >
      <el-form ref="dataScopeRef" :model="form" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="form.roleName" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限字符">
          <el-input v-model="form.roleKey" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限范围">
          <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
            <el-option
              v-for="item in dataScopeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-show="form.dataScope === '2'" label="数据权限">
          <el-checkbox
            v-model="deptExpand"
            @change="handleCheckedTreeExpand($event, 'dept')"
          >
            展开/折叠
          </el-checkbox>
          <el-checkbox
            v-model="deptNodeAll"
            @change="handleCheckedTreeNodeAll($event, 'dept')"
          >
            全选/全不选
          </el-checkbox>
          <el-checkbox
            v-model="form.deptCheckStrictly"
            @change="handleCheckedTreeConnect($event, 'dept')"
          >
            父子联动
          </el-checkbox>
          <el-tree
            ref="deptRef"
            class="tree-border"
            :data="deptOptions"
            show-checkbox
            default-expand-all
            node-key="id"
            :check-strictly="!form.deptCheckStrictly"
            empty-text="加载中，请稍候"
            :props="{ label: 'label', children: 'children' }"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitDataScope">
            确 定
          </el-button>
          <el-button @click="cancelDataScope">
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>

    <PermissionDialogVisible
      v-if="permissionDialog"
      :permission-row-data="permissionRowData"
      :permission-dialog="permissionDialog"
      @close="handleClose"
    />
  </FaPageMain>
</template>
