<script setup lang="ts">
import type { ClientForm, ClientQuery, ClientVO } from '@/api/modules/system/client/types'
import { QuestionFilled, RefreshRight, Search } from '@element-plus/icons-vue'
import { addClient, changeStatus, delClient, getClient, listClient, updateClient } from '@/api/modules/system/client'
import DictTag from '@/components/RuoYi/DictTag/index.vue'
import RightToolbar from '@/components/RuoYi/RightToolbar/index.vue'
import { useDict } from '@/composables/useDict'
import { download } from '@/utils/download'

defineOptions({
  name: 'Client',
})

const { confirm } = useFaModal()
const { success } = useFaToast()
const { getDictOptions } = useDict()

const sysNormalDisableOptions = getDictOptions('sys_normal_disable')
const sysGrantTypeOptions = getDictOptions('sys_grant_type')
const sysDeviceTypeOptions = getDictOptions('sys_device_type')

const pagedList = ref<ClientVO[]>([])
const buttonLoading = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const searchFold = ref(false)
const ids = ref<Array<string | number>>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)

const queryFormRef = ref<ElFormInstance>()
const clientFormRef = ref<ElFormInstance>()

const dialog = reactive({
  visible: false,
  title: '',
})

const initFormData: ClientForm = {
  id: undefined,
  clientId: undefined,
  clientKey: undefined,
  clientSecret: undefined,
  grantTypeList: undefined,
  deviceType: undefined,
  activeTimeout: undefined,
  timeout: undefined,
  status: undefined,
}

const form = reactive<ClientForm>({ ...initFormData })

const queryParams = reactive<ClientQuery>({
  pageNum: 1,
  pageSize: 10,
  clientId: undefined,
  clientKey: undefined,
  clientSecret: undefined,
  grantType: undefined,
  deviceType: undefined,
  activeTimeout: undefined,
  timeout: undefined,
  status: undefined,
})

const rules = {
  id: [{ required: true, message: 'id不能为空', trigger: 'blur' }],
  clientId: [{ required: true, message: '客户端id不能为空', trigger: 'blur' }],
  clientKey: [{ required: true, message: '客户端key不能为空', trigger: 'blur' }],
  clientSecret: [{ required: true, message: '客户端秘钥不能为空', trigger: 'blur' }],
  grantTypeList: [{ required: true, message: '授权类型不能为空', trigger: 'change' }],
  deviceType: [{ required: true, message: '设备类型不能为空', trigger: 'change' }],
}

async function getList() {
  loading.value = true
  try {
    const res = await listClient(queryParams)
    pagedList.value = res.rows
    total.value = res.total
  }
  finally {
    loading.value = false
  }
}

function cancel() {
  reset()
  dialog.visible = false
}

function reset() {
  Object.assign(form, initFormData)
  clientFormRef.value?.resetFields()
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryFormRef.value?.resetFields()
  handleQuery()
}

function handleSelectionChange(selection: ClientVO[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  dialog.visible = true
  dialog.title = '添加客户端管理'
}

async function handleUpdate(row?: ClientVO) {
  reset()
  const _id = row?.id || ids.value[0]
  const res = await getClient(_id)
  Object.assign(form, res.data)
  dialog.visible = true
  dialog.title = '修改客户端管理'
}

function submitForm() {
  clientFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true
      try {
        if (form.id) {
          await updateClient(form)
        }
        else {
          await addClient(form)
        }
        success('修改成功')
        dialog.visible = false
        getList()
      }
      finally {
        buttonLoading.value = false
      }
    }
  })
}

async function handleDelete(row?: ClientVO) {
  const _ids = row?.id || ids.value
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认删除客户端管理编号为"${_ids}"的数据项？`,
      type: 'warning',
    })
    await delClient(_ids)
    success('删除成功')
    getList()
  }
  catch {
    // 用户取消
  }
}

function handleExport() {
  download('/system/client/export', { ...queryParams }, `client_${Date.now()}.xlsx`)
}

async function handleStatusChange(row: ClientVO) {
  const text = row.status === '0' ? '启用' : '停用'
  try {
    await confirm({
      title: '系统提示',
      content: `确认要"${text}"吗?`,
      type: 'warning',
    })
    await changeStatus(row.clientId, row.status)
    success(`${text}成功`)
  }
  catch {
    row.status = row.status === '0' ? '1' : '0'
  }
}

onMounted(() => {
  getList()
})
</script>

<template>
  <FaPageMain>
    <FaSearchBar v-model:fold="searchFold" :show-toggle="true" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="85px">
        <el-form-item label="客户端key" prop="clientKey">
          <el-input v-model="queryParams.clientKey" placeholder="请输入客户端key" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="客户端秘钥" prop="clientSecret">
          <el-input v-model="queryParams.clientSecret" placeholder="请输入客户端秘钥" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="状态" clearable>
            <el-option v-for="dict in sysNormalDisableOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
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
        <FaButton v-auth="['system:client:add']" @click="handleAdd">
          <FaIcon name="i-lucide:plus" class="mr-1" /> 新增
        </FaButton>
        <FaButton v-auth="['system:client:edit']" variant="secondary" :disabled="single" @click="handleUpdate()">
          <FaIcon name="i-lucide:edit" class="mr-1" /> 修改
        </FaButton>
        <FaButton v-auth="['system:client:remove']" variant="destructive" :disabled="multiple" @click="handleDelete()">
          <FaIcon name="i-lucide:trash-2" class="mr-1" /> 删除
        </FaButton>
        <FaButton v-auth="['system:client:export']" variant="outline" @click="handleExport">
          <FaIcon name="i-lucide:download" class="mr-1" /> 导出
        </FaButton>
      </div>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </div>

    <el-table v-loading="loading" border :data="pagedList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column v-if="true" label="id" align="center" prop="id" />
      <el-table-column label="客户端id" align="center" prop="clientId" />
      <el-table-column label="客户端key" align="center" prop="clientKey" />
      <el-table-column label="客户端秘钥" align="center" prop="clientSecret" />
      <el-table-column label="授权类型" align="center">
        <template #default="scope">
          <DictTag :options="sysGrantTypeOptions" :value="scope.row.grantTypeList" />
        </template>
      </el-table-column>
      <el-table-column label="设备类型" align="center">
        <template #default="scope">
          <DictTag :options="sysDeviceTypeOptions" :value="scope.row.deviceType" />
        </template>
      </el-table-column>
      <el-table-column label="Token活跃超时时间" align="center" prop="activeTimeout" />
      <el-table-column label="Token固定超时时间" align="center" prop="timeout" />
      <el-table-column key="status" label="状态" align="center">
        <template #default="scope">
          <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button v-auth="['system:client:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button v-auth="['system:client:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <FaPagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:size="queryParams.pageSize" :total="total" class="mt-4" @page-change="getList" @size-change="getList" />

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="clientFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="客户端key" prop="clientKey">
          <el-input v-model="form.clientKey" :disabled="form.id != null" placeholder="请输入客户端key" />
        </el-form-item>
        <el-form-item label="客户端秘钥" prop="clientSecret">
          <el-input v-model="form.clientSecret" :disabled="form.id != null" placeholder="请输入客户端秘钥" />
        </el-form-item>
        <el-form-item label="授权类型" prop="grantTypeList">
          <el-select v-model="form.grantTypeList" multiple placeholder="请输入授权类型">
            <el-option v-for="dict in sysGrantTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备类型" prop="deviceType">
          <el-select v-model="form.deviceType" placeholder="请输入设备类型">
            <el-option v-for="dict in sysDeviceTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item prop="activeTimeout" label-width="auto">
          <template #label>
            <span>
              <el-tooltip content="指定时间无操作则过期（单位：秒），默认30分钟（1800秒）" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
              Token活跃超时时间
            </span>
          </template>
          <el-input v-model="form.activeTimeout" placeholder="请输入Token活跃超时时间" />
        </el-form-item>
        <el-form-item prop="timeout" label-width="auto">
          <template #label>
            <span>
              <el-tooltip content="指定时间必定过期（单位：秒），默认七天（604800秒）" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
              Token固定超时时间
            </span>
          </template>
          <el-input v-model="form.timeout" placeholder="请输入Token固定超时时间" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sysNormalDisableOptions" :key="dict.value" :value="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
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
