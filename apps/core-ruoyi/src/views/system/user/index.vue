<script setup lang="ts">
import type { DeptTreeVO, DeptVO } from '@/api/modules/system/dept/types'
import type { PostVO, RoleVO, UserForm, UserQuery, UserVO } from '@/api/modules/system/user/types'
import { ArrowDown, CircleCheck, Delete, Download, Edit, Key, Plus, Refresh, Search, Top } from '@element-plus/icons-vue'
import { to } from 'await-to-js'
import { ElMessageBox } from 'element-plus'
import { getConfigKey } from '@/api/modules/system/config'
import { optionselect } from '@/api/modules/system/post'
import api from '@/api/modules/system/user'
import RightToolbar from '@/components/RuoYi/RightToolbar/index.vue'
import { useDict } from '@/composables/useDict'
import { useAppAccountStore } from '@/store/modules/app/account'
import { download } from '@/utils/download'
import { checkPermi } from '@/utils/permission'
import { globalHeaders } from '@/utils/request'

defineOptions({
  name: 'User',
})

// Hooks
const router = useRouter()
const { success: toastSuccess } = useFaToast()
const { confirm } = useFaModal()
const { getDictOptions, loadDicts } = useDict()

// 账号Store
const appAccountStore = useAppAccountStore()

// 字典数据
const sysNormalDisableOptions = getDictOptions('sys_normal_disable')
const sysUserSexOptions = getDictOptions('sys_user_sex')

// 加载字典
loadDicts('sys_normal_disable', 'sys_user_sex')

// 状态
const pagedList = ref<UserVO[]>([])
const loading = ref(true)
const searchFold = ref(false)
const ids = ref<Array<number | string>>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const dateRange = ref<[string, string]>(['', ''])
const deptName = ref('')
const deptOptions = ref<DeptTreeVO[]>([])
const enabledDeptOptions = ref<DeptTreeVO[]>([])
const initPassword = ref<string>('')
const policyPassword = ref<string>('')
const policyPasswordTitle = ref<string>('')
const postOptions = ref<PostVO[]>([])
const roleOptions = ref<RoleVO[]>([])

/** * 用户导入参数 */
const upload = reactive<ImportOption>({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: `${import.meta.env.VITE_APP_BASE_API}/system/user/importData`,
})

// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: `用户编号`, visible: false, children: [] },
  { key: 1, label: `用户名称`, visible: true, children: [] },
  { key: 2, label: `用户昵称`, visible: true, children: [] },
  { key: 3, label: `部门`, visible: true, children: [] },
  { key: 4, label: `手机号码`, visible: true, children: [] },
  { key: 5, label: `状态`, visible: true, children: [] },
  { key: 6, label: `创建时间`, visible: true, children: [] },
])

const deptTreeRef = ref<ElTreeInstance>()
const queryFormRef = ref<ElFormInstance>()
const userFormRef = ref<ElFormInstance>()
const uploadRef = ref<ElUploadInstance>()
const formDialogRef = ref<ElDialogInstance>()

const dialog = reactive<DialogOption>({
  visible: false,
  title: '',
})

const initFormData: UserForm = {
  userId: undefined,
  deptId: undefined,
  userName: '',
  nickName: undefined,
  password: '',
  phonenumber: undefined,
  email: undefined,
  sex: undefined,
  status: '0',
  remark: '',
  postIds: [],
  roleIds: [],
}

// 动态密码验证函数
function validatePassword(rule: unknown, value: string, callback: (error?: Error) => void) {
  if (!value) {
    callback(new Error('用户密码不能为空'))
  }
  else if (policyPassword.value && policyPassword.value !== '') {
    // 使用动态策略进行验证
    const regex = new RegExp(policyPassword.value)
    if (!regex.test(value)) {
      callback(
        new Error(
          policyPasswordTitle.value
          || '密码需包含大小写字母和数字，且长度不少于8位',
        ),
      )
    }
    else {
      callback()
    }
  }
  else {
    // 如果没有动态策略，则使用默认验证
    if (value.length < 5 || value.length > 20) {
      callback(new Error('用户密码长度必须介于 5 和 20 之间'))
    }
    else if (/[<>'|]/.test(value)) {
      callback(new Error('不能包含非法字符：< > " \' \\ |'))
    }
    else {
      callback()
    }
  }
}

const initData: PageData<UserForm, UserQuery> = {
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: '',
    phonenumber: '',
    status: '',
    deptId: '',
    roleId: '',
  },
  rules: {
    userName: [
      { required: true, message: '用户名称不能为空', trigger: 'blur' },
      {
        min: 2,
        max: 20,
        message: '用户名称长度必须介于 2 和 20 之间',
        trigger: 'blur',
      },
    ],
    nickName: [
      { required: true, message: '用户昵称不能为空', trigger: 'blur' },
    ],
    password: [{ validator: validatePassword, trigger: 'blur' }],
    email: [
      {
        type: 'email',
        message: '请输入正确的邮箱地址',
        trigger: ['blur', 'change'],
      },
    ],
    phonenumber: [
      {
        pattern: /^1[3-9]\d{9}$/,
        message: '请输入正确的手机号码',
        trigger: 'blur',
      },
    ],
    roleIds: [{ required: true, message: '用户角色不能为空', trigger: 'blur' }],
  },
}
const data = reactive<PageData<UserForm, UserQuery>>(initData)

const { queryParams, form, rules } = toRefs<PageData<UserForm, UserQuery>>(data)

/** 通过条件过滤节点  */
function filterNode(value: string, data: { label?: string }) {
  if (!value) {
    return true
  }
  return data.label.includes(value)
}

/** 根据名称筛选部门树 */
watchEffect(
  () => {
    deptTreeRef.value?.filter(deptName.value)
  },
  {
    flush: 'post',
  },
)

/** 添加日期范围到查询参数 */
function addDateRange(params: Record<string, unknown>, range: [string, string]) {
  const search = { ...params }
  if (range && range.length === 2) {
    search.beginTime = range[0]
    search.endTime = range[1]
  }
  return search
}

/** 查询用户列表 */
async function getList() {
  loading.value = true
  try {
    const searchParams = addDateRange(queryParams.value, dateRange.value)
    const data = await api.listUser(searchParams)
    pagedList.value = data.rows
    total.value = data.total
  }
  finally {
    loading.value = false
  }
}

/** 查询部门下拉树结构 */
async function getDeptTree() {
  const res = await api.deptTreeSelect()
  deptOptions.value = res.data
  enabledDeptOptions.value = filterDisabledDept(res.data)
}

/** 过滤禁用的部门 */
function filterDisabledDept(deptList: DeptTreeVO[]) {
  return deptList.filter((dept) => {
    if (dept.disabled) {
      return false
    }
    if (dept.children && dept.children.length) {
      dept.children = filterDisabledDept(dept.children)
    }
    return true
  })
}

/** 节点单击事件 */
function handleNodeClick(data: DeptVO) {
  queryParams.value.deptId = data.id
  handleQuery()
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = ['', '']
  queryFormRef.value?.resetFields()
  queryParams.value.pageNum = 1
  queryParams.value.deptId = undefined
  deptTreeRef.value?.setCurrentKey(undefined)
  handleQuery()
}

/** 删除按钮操作 */
async function handleDelete(row?: UserVO) {
  const userIds = row?.userId || ids.value
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认删除用户编号为"${userIds}"的数据项？`,
      type: 'warning',
    })
    await api.delUser(userIds)
    await getList()
    toastSuccess('删除成功')
  }
  catch {
    // 用户取消
  }
}

/** 用户状态修改  */
async function handleStatusChange(row: UserVO) {
  const text = row.status === '0' ? '启用' : '停用'
  try {
    await confirm({
      title: '系统提示',
      content: `确认要"${text}""${row.userName}"用户吗?`,
      type: 'warning',
    })
    await api.changeUserStatus(row.userId, row.status)
    toastSuccess(`${text}成功`)
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (err) {
    row.status = row.status === '0' ? '1' : '0'
  }
}

/** 跳转角色分配 */
function handleAuthRole(row: UserVO) {
  const userId = row.userId
  router.push(`/system/user-auth/role/${userId}`)
}

/** 重置密码按钮操作 */
async function handleResetPwd(row: UserVO) {
  const [err, res] = await to(
    ElMessageBox.prompt(`请输入"${row.userName}"的新密码`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      closeOnClickModal: false,
      inputPattern: policyPassword.value
        ? new RegExp(policyPassword.value)
        : /^.{5,20}$/,
      inputErrorMessage:
        policyPasswordTitle.value
        || '密码需包含大小写字母和数字，且长度不少于8位',
      inputValidator: (value) => {
        if (policyPassword.value && policyPassword.value !== '') {
          // 使用动态策略进行验证
          const regex = new RegExp(policyPassword.value)
          if (!regex.test(value)) {
            return (
              policyPasswordTitle.value
              || '密码需包含大小写字母和数字，且长度不少于8位'
            )
          }
        }
        else {
          // 默认验证逻辑
          if (value.length < 5 || value.length > 20) {
            return '用户密码长度必须介于 5 和 20 之间'
          }
          else if (/[<>'|]/.test(value)) {
            return '不能包含非法字符：< > " \' \\ |'
          }
        }
      },
    }),
  )
  if (!err && res) {
    await api.resetUserPwd(row.userId, res.value)
    toastSuccess(`修改成功，新密码是：${res.value}`)
  }
}

/** 选择条数  */
function handleSelectionChange(selection: UserVO[]) {
  ids.value = selection.map(item => item.userId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 导入按钮操作 */
function handleImport() {
  upload.title = '用户导入'
  upload.open = true
}

/** 导出按钮操作 */
function handleExport() {
  download(
    'system/user/export',
    {
      ...queryParams.value,
    },
    `user_${Date.now()}.xlsx`,
  )
}

/** 下载模板操作 */
function importTemplate() {
  download(
    'system/user/importTemplate',
    {},
    `user_template_${Date.now()}.xlsx`,
  )
}

/** 文件上传中处理 */
function handleFileUploadProgress() {
  upload.isUploading = true
}

/** 文件上传成功处理 */
function handleFileSuccess(response: any, file: UploadFile) {
  upload.open = false
  upload.isUploading = false
  uploadRef.value?.handleRemove(file)
  ElMessageBox.alert(
    `<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>${
      response.msg
    }</div>`,
    '导入结果',
    {
      dangerouslyUseHTMLString: true,
    },
  )
  getList()
}

/** 提交上传文件 */
function submitFileForm() {
  uploadRef.value?.submit()
}

/** 重置操作表单 */
function reset() {
  form.value = { ...initFormData }
  userFormRef.value?.resetFields()
}

/** 取消按钮 */
function cancel() {
  dialog.visible = false
  reset()
}

/** 新增按钮操作 */
async function handleAdd() {
  reset()
  const { data } = await api.getUser()
  dialog.visible = true
  dialog.title = '新增用户'
  postOptions.value = data.posts
  roleOptions.value = data.roles
  form.value.password = initPassword.value.toString()
}

/** 修改按钮操作 */
async function handleUpdate(row?: UserForm) {
  reset()
  const userId = row?.userId || ids.value[0]
  const { data } = await api.getUser(userId)
  dialog.visible = true
  dialog.title = '修改用户'
  Object.assign(form.value, data.user)
  postOptions.value = data.posts
  roleOptions.value = Array.from(
    new Map(
      [...data.roles, ...data.user.roles].map(role => [role.roleId, role]),
    ).values(),
  )
  form.value.postIds = data.postIds
  form.value.roleIds = data.roleIds
  form.value.password = ''
}

/** 提交按钮 */
function submitForm() {
  userFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.userId) {
        // 自己编辑自己的情况下 不允许编辑角色部门岗位
        if (form.value.userId === appAccountStore.userId) {
          form.value.roleIds = null
          form.value.deptId = null
          form.value.postIds = null
        }
        await api.updateUser(form.value)
      }
      else {
        await api.addUser(form.value)
      }
      toastSuccess('操作成功')
      dialog.visible = false
      await getList()
    }
  })
}

/**
 * 关闭用户弹窗
 */
function closeDialog() {
  dialog.visible = false
  resetForm()
}

/**
 * 重置表单
 */
function resetForm() {
  userFormRef.value?.resetFields()
  userFormRef.value?.clearValidate()

  form.value.id = undefined
  form.value.status = '1'
}

onMounted(() => {
  getDeptTree()
  getList()
  getConfigKey('sys.user.initPassword').then((response: any) => {
    initPassword.value = response.data
  })
  getConfigKey('sys.account.password.policy').then((response: any) => {
    policyPassword.value = response.data
  })
  getConfigKey('sys.account.password.title').then((response: any) => {
    policyPasswordTitle.value = response.data
  })
})

async function handleDeptChange(value: number | string) {
  const response = await optionselect(value)
  postOptions.value = response.data
  form.value.postIds = []
}
</script>

<template>
  <FaPageMain>
    <el-row :gutter="20">
      <!-- 部门树 -->
      <el-col :lg="4" :xs="24">
        <el-card shadow="hover">
          <el-input
            v-model="deptName"
            placeholder="请输入部门名称"
            prefix-icon="Search"
            clearable
          />
          <el-tree
            ref="deptTreeRef"
            class="mt-2"
            node-key="id"
            :data="deptOptions"
            :props="{ label: 'label', children: 'children' } as any"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          />
        </el-card>
      </el-col>
      <el-col :lg="20" :xs="24">
        <!-- 搜索栏 -->
        <FaSearchBar v-model:fold="searchFold" :show-toggle="true" class="mb-4">
          <el-form
            ref="queryFormRef"
            :model="queryParams"
            :inline="true"
          >
            <el-form-item label="用户名称" prop="userName">
              <el-input
                v-model="queryParams.userName"
                placeholder="请输入用户名称"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="用户昵称" prop="nickName">
              <el-input
                v-model="queryParams.nickName"
                placeholder="请输入用户昵称"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input
                v-model="queryParams.phonenumber"
                placeholder="请输入手机号码"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="queryParams.status"
                placeholder="用户状态"
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
            <el-form-item label="创建时间">
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
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="resetQuery">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </FaSearchBar>

        <el-card shadow="hover">
          <template #header>
            <el-row :gutter="10">
              <el-col :span="1.5">
                <el-button
                  v-auth="['system:user:add']"
                  type="primary"
                  plain
                  @click="handleAdd()"
                >
                  <el-icon><Plus /></el-icon>
                  新增
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-auth="['system:user:edit']"
                  type="success"
                  plain
                  :disabled="single"
                  @click="handleUpdate()"
                >
                  <el-icon><Edit /></el-icon>
                  修改
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-auth="['system:user:remove']"
                  type="danger"
                  plain
                  :disabled="multiple"
                  @click="handleDelete()"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-dropdown class="mt-[1px]">
                  <el-button plain type="info">
                    更多
                    <el-icon class="el-icon--right">
                      <ArrowDown />
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="importTemplate">
                        <el-icon><Download /></el-icon>
                        下载模板
                      </el-dropdown-item>
                      <el-dropdown-item
                        v-if="checkPermi(['system:user:import'])"
                        @click="handleImport"
                      >
                        <el-icon><Top /></el-icon>
                        导入数据
                      </el-dropdown-item>
                      <el-dropdown-item
                        v-if="checkPermi(['system:user:export'])"
                        @click="handleExport"
                      >
                        <el-icon><Download /></el-icon>
                        导出数据
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-col>
              <RightToolbar :columns="columns" />
            </el-row>
          </template>

          <el-table
            v-loading="loading"
            border
            :data="pagedList"
            size="small"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column
              v-if="columns[0].visible"
              key="userId"
              label="用户编号"
              align="center"
              prop="userId"
            />
            <el-table-column
              v-if="columns[1].visible"
              key="userName"
              label="用户名称"
              align="center"
              prop="userName"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              v-if="columns[2].visible"
              key="nickName"
              label="用户昵称"
              align="center"
              prop="nickName"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              v-if="columns[3].visible"
              key="deptName"
              label="部门"
              align="center"
              prop="deptName"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              v-if="columns[4].visible"
              key="phonenumber"
              label="手机号码"
              align="center"
              prop="phonenumber"
              width="120"
            />
            <el-table-column
              v-if="columns[5].visible"
              key="status"
              label="状态"
              align="center"
            >
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
              v-if="columns[6].visible"
              label="创建时间"
              align="center"
              prop="createTime"
              width="160"
            >
              <template #default="scope">
                <span>{{ scope.row.createTime }}</span>
              </template>
            </el-table-column>

            <el-table-column
              label="操作"
              fixed="right"
              width="180"
              class-name="small-padding fixed-width"
            >
              <template #default="scope">
                <el-tooltip content="修改" placement="top">
                  <el-button
                    v-auth="['system:user:edit']"
                    link
                    type="primary"
                    @click="handleUpdate(scope.row)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button
                    v-auth="['system:user:remove']"
                    link
                    type="primary"
                    @click="handleDelete(scope.row)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip content="重置密码" placement="top">
                  <el-button
                    v-auth="['system:user:resetPwd']"
                    link
                    type="primary"
                    @click="handleResetPwd(scope.row)"
                  >
                    <el-icon><Key /></el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip content="分配角色" placement="top">
                  <el-button
                    v-auth="['system:user:edit']"
                    link
                    type="primary"
                    @click="handleAuthRole(scope.row)"
                  >
                    <el-icon><CircleCheck /></el-icon>
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
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog
      ref="formDialogRef"
      v-model="dialog.visible"
      :title="dialog.title"
      width="600px"
      append-to-body
      @close="closeDialog"
    >
      <el-form
        ref="userFormRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input
                v-model="form.nickName"
                placeholder="请输入用户昵称"
                maxlength="30"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.userId == null || form.userId !== appAccountStore.userId"
            :span="12"
          >
            <el-form-item label="归属部门" prop="deptId">
              <el-tree-select
                v-model="form.deptId"
                :data="enabledDeptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' } as any"
                value-key="id"
                placeholder="请选择归属部门"
                check-strictly
                @change="handleDeptChange"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input
                v-model="form.phonenumber"
                placeholder="请输入手机号码"
                maxlength="11"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="form.email"
                placeholder="请输入邮箱"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              v-if="!form.userId"
              label="用户名称"
              prop="userName"
            >
              <el-input
                v-model="form.userName"
                placeholder="请输入用户名称"
                maxlength="30"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="!form.userId"
              label="用户密码"
              prop="password"
            >
              <el-input
                v-model="form.password"
                placeholder="请输入用户密码"
                type="password"
                maxlength="20"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="form.sex" placeholder="请选择">
                <el-option
                  v-for="dict in sysUserSexOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in sysNormalDisableOptions"
                  :key="dict.value"
                  :value="dict.value"
                >
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col
            v-if="!form.userId || form.userId !== appAccountStore.userId"
            :span="12"
          >
            <el-form-item label="岗位">
              <el-select v-model="form.postIds" multiple placeholder="请选择">
                <el-option
                  v-for="item in postOptions"
                  :key="item.postId"
                  :label="item.postName"
                  :value="item.postId"
                  :disabled="item.status === '1'"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" prop="roleIds">
              <el-select
                v-model="form.roleIds"
                filterable
                multiple
                placeholder="请选择"
              >
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.status === '1'"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="form.remark"
                type="textarea"
                placeholder="请输入内容"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">
            确 定
          </el-button>
          <el-button @click="cancel()">
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog
      v-model="upload.open"
      :title="upload.title"
      width="400px"
      append-to-body
    >
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="`${upload.url}?updateSupport=${upload.updateSupport}`"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload">
          <i-ep-upload-filled />
        </el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox
                v-model="upload.updateSupport"
              />是否更新已经存在的用户数据
            </div>
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link
              type="primary"
              :underline="false"
              style="font-size: 12px; vertical-align: baseline;"
              @click="importTemplate"
            >
              下载模板
            </el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">
            确 定
          </el-button>
          <el-button @click="upload.open = false">
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>
  </FaPageMain>
</template>
