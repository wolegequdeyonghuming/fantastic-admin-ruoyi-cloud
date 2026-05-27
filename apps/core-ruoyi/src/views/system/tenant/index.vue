<script setup lang="ts">
import type { TenantForm, TenantQuery, TenantVO } from '@/api/modules/system/tenant/types'
import type { TenantPkgVO } from '@/api/modules/system/tenantPackage/types'
import dayjs from 'dayjs'
import {
  addTenant,
  changeTenantStatus,
  delTenant,
  getTenant,
  listTenant,
  syncTenantConfig,
  syncTenantDict,
  syncTenantPackage,
  updateTenant,
} from '@/api/modules/system/tenant'
import { selectTenantPackage } from '@/api/modules/system/tenantPackage'
import { useAppAccountStore } from '@/store/modules/app/account'

defineOptions({ name: 'Tenant' })

const { success: toastSuccess } = useFaToast()
const { confirm } = useFaModal()

const userStore = useAppAccountStore()
const userId = ref(userStore.userId)
const tenantList = ref<TenantVO[]>([])
const packageList = ref<TenantPkgVO[]>([])
const buttonLoading = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const searchFold = ref(false)
const ids = ref<Array<string | number>>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)

const queryFormRef = ref<ElFormInstance>()
const tenantFormRef = ref<ElFormInstance>()

const dialog = reactive<DialogOption>({
  visible: false,
  title: '',
})

const initFormData: TenantForm = {
  id: undefined,
  tenantId: undefined,
  contactUserName: '',
  contactPhone: '',
  username: '',
  password: '',
  companyName: '',
  licenseNumber: '',
  domain: '',
  address: '',
  intro: '',
  remark: '',
  packageId: '',
  expireTime: '',
  accountCount: 0,
  status: '0',
}
const data = reactive<PageData<TenantForm, TenantQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tenantId: '',
    contactUserName: '',
    contactPhone: '',
    companyName: '',
  },
  rules: {
    id: [{ required: true, message: 'id不能为空', trigger: 'blur' }],
    tenantId: [
      { required: true, message: '租户编号不能为空', trigger: 'blur' },
    ],
    contactUserName: [
      { required: true, message: '联系人不能为空', trigger: 'blur' },
    ],
    contactPhone: [
      { required: true, message: '联系电话不能为空', trigger: 'blur' },
    ],
    companyName: [
      { required: true, message: '企业名称不能为空', trigger: 'blur' },
    ],
    username: [
      { required: true, message: '用户名不能为空', trigger: 'blur' },
      {
        min: 2,
        max: 20,
        message: '用户名称长度必须介于 2 和 20 之间',
        trigger: 'blur',
      },
    ],
    password: [
      { required: true, message: '密码不能为空', trigger: 'blur' },
      {
        min: 5,
        max: 20,
        message: '用户密码长度必须介于 5 和 20 之间',
        trigger: 'blur',
      },
    ],
  },
})

const { queryParams, form, rules } = toRefs(data)

/** 查询所有租户套餐 */
async function getTenantPackage() {
  const res = await selectTenantPackage()
  packageList.value = res.data
}

/** 查询租户列表 */
async function getList() {
  loading.value = true
  const res = await listTenant(queryParams.value)
  tenantList.value = res.rows
  total.value = res.total
  loading.value = false
}

// 租户套餐状态修改
async function handleStatusChange(row: TenantVO) {
  const text = row.status === '0' ? '启用' : '停用'
  try {
    await confirm({
      title: '系统提示',
      content: `确认要"${text}""${row.companyName}"租户吗？`,
      type: 'warning',
    })
    await changeTenantStatus(row.id, row.tenantId, row.status)
    toastSuccess(`${text}成功`)
  }
  catch {
    row.status = row.status === '0' ? '1' : '0'
  }
}

// 取消按钮
function cancel() {
  reset()
  dialog.visible = false
}

// 表单重置
function reset() {
  form.value = { ...initFormData }
  tenantFormRef.value?.resetFields()
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

// 多选框选中数据
function handleSelectionChange(selection: TenantVO[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  getTenantPackage()
  dialog.visible = true
  dialog.title = '添加租户'
}

/** 修改按钮操作 */
async function handleUpdate(row?: TenantVO) {
  reset()
  await getTenantPackage()
  const _id = row?.id || ids.value[0]
  const res = await getTenant(_id)
  Object.assign(form.value, res.data)
  dialog.visible = true
  dialog.title = '修改租户'
}

/** 提交按钮 */
function submitForm() {
  tenantFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true
      if (form.value.id) {
        await updateTenant(form.value).finally(
          () => (buttonLoading.value = false),
        )
      }
      else {
        await addTenant(form.value).finally(
          () => (buttonLoading.value = false),
        )
      }
      toastSuccess('操作成功')
      dialog.visible = false
      await getList()
    }
  })
}

/** 删除按钮操作 */
async function handleDelete(row?: TenantVO) {
  const _ids = row?.id || ids.value
  await confirm({
    title: '系统提示',
    content: `是否确认删除租户编号为"${_ids}"的数据项？`,
    type: 'warning',
  })
  loading.value = true
  await delTenant(_ids).finally(() => (loading.value = false))
  await getList()
  toastSuccess('删除成功')
}

/** 同步租户套餐按钮操作 */
async function handleSyncTenantPackage(row: TenantVO) {
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认同步租户套餐租户编号为"${row.tenantId}"的数据项？`,
      type: 'warning',
    })
    loading.value = true
    await syncTenantPackage(row.tenantId, row.packageId)
    await getList()
    toastSuccess('同步成功')
  }
  catch {
    return
  }
  finally {
    loading.value = false
  }
}

/** 导出按钮操作 */
function handleExport() {
  // TODO: 导出功能需要实现或使用其他方式
  // console.log('导出功能待实现', queryParams.value)
}

/** 同步租户字典 */
async function handleSyncTenantDict() {
  await confirm({
    title: '系统提示',
    content: '确认要同步所有租户字典吗？',
    type: 'warning',
  })
  const res = await syncTenantDict()
  toastSuccess(res.msg)
}

/** 同步租户参数配置 */
async function handleSyncTenantConfig() {
  await confirm({
    title: '系统提示',
    content: '确认要同步所有租户参数配置吗？',
    type: 'warning',
  })
  const res = await syncTenantConfig()
  toastSuccess(res.msg)
}

onMounted(() => {
  getList()
})
</script>

<template>
  <FaPageMain>
    <transition
      enter-active-class="animate-fade-in-down"
      leave-active-class="animate-fade-out-up"
    >
      <div v-show="showSearch" class="mb-4">
        <FaSearchBar v-model:fold="searchFold" :show-toggle="true">
          <el-form
            ref="queryFormRef"
            :model="queryParams"
            :inline="true"
            size="small"
          >
            <el-form-item label="租户编号" prop="tenantId">
              <el-input
                v-model="queryParams.tenantId"
                placeholder="请输入租户编号"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="联系人" prop="contactUserName">
              <el-input
                v-model="queryParams.contactUserName"
                placeholder="请输入联系人"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input
                v-model="queryParams.contactPhone"
                placeholder="请输入联系电话"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="企业名称" prop="companyName">
              <el-input
                v-model="queryParams.companyName"
                placeholder="请输入企业名称"
                clearable
                @keyup.enter="handleQuery"
              />
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

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:tenant:add']"
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd"
            >
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:tenant:edit']"
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate()"
            >
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:tenant:remove']"
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete()"
            >
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:tenant:export']"
              type="warning"
              plain
              icon="Download"
              @click="handleExport"
            >
              导出
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-if="userId === 1"
              type="success"
              plain
              icon="Refresh"
              @click="handleSyncTenantDict"
            >
              同步租户字典
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-if="userId === 1"
              type="success"
              plain
              icon="Refresh"
              @click="handleSyncTenantConfig"
            >
              同步租户参数配置
            </el-button>
          </el-col>
          <right-toolbar
            v-model:show-search="showSearch"
            @query-table="getList"
          />
        </el-row>
      </template>

      <el-table
        v-loading="loading"
        border
        :data="tenantList"
        size="small"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="id" align="center" prop="id" />
        <el-table-column label="租户编号" align="center" prop="tenantId" />
        <el-table-column label="联系人" align="center" prop="contactUserName" />
        <el-table-column label="联系电话" align="center" prop="contactPhone" />
        <el-table-column label="企业名称" align="center" prop="companyName" />
        <el-table-column
          label="社会信用代码"
          align="center"
          prop="licenseNumber"
        />
        <el-table-column
          label="过期时间"
          align="center"
          prop="expireTime"
          width="180"
        >
          <template #default="scope">
            <span>{{ dayjs(scope.row.expireTime).format("YYYY-MM-DD HH:mm:ss") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="租户状态" align="center" prop="status">
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
          width="150"
          label="操作"
          align="center"
          fixed="right"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button
                v-hasPermi="['system:tenant:edit']"
                link
                type="primary"
                icon="Edit"
                @click="handleUpdate(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="同步套餐" placement="top">
              <el-button
                v-hasPermi="['system:tenant:edit']"
                link
                type="primary"
                icon="Refresh"
                @click="handleSyncTenantPackage(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                v-hasPermi="['system:tenant:remove']"
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
    </el-card>
    <!-- 添加或修改租户对话框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      append-to-body
    >
      <el-form
        ref="tenantFormRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="企业名称" prop="companyName">
          <el-input v-model="form.companyName" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactUserName">
          <el-input v-model="form.contactUserName" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item v-if="!form.id" label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入系统用户名"
            maxlength="30"
          />
        </el-form-item>
        <el-form-item v-if="!form.id" label="用户密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入系统用户密码"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="租户套餐" prop="packageId">
          <el-select
            v-model="form.packageId"
            :disabled="!!form.tenantId"
            placeholder="请选择租户套餐"
            clearable
            style="width: 100%;"
          >
            <el-option
              v-for="item in packageList"
              :key="item.packageId"
              :label="item.packageName"
              :value="item.packageId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="过期时间" prop="expireTime">
          <el-date-picker
            v-model="form.expireTime"
            clearable
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择过期时间"
          />
        </el-form-item>
        <el-form-item label="用户数量" prop="accountCount">
          <el-input v-model="form.accountCount" placeholder="请输入用户数量" />
        </el-form-item>
        <el-form-item label="绑定域名" prop="domain">
          <el-input v-model="form.domain" placeholder="请输入绑定域名" />
        </el-form-item>
        <el-form-item label="企业地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入企业地址" />
        </el-form-item>
        <el-form-item label="企业代码" prop="licenseNumber">
          <el-input
            v-model="form.licenseNumber"
            placeholder="请输入统一社会信用代码"
          />
        </el-form-item>
        <el-form-item label="企业简介" prop="intro">
          <el-input
            v-model="form.intro"
            type="textarea"
            placeholder="请输入企业简介"
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
