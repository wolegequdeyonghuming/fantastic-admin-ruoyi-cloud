<script setup lang="ts">
import type { OssConfigForm, OssConfigQuery, OssConfigVO } from '@/api/modules/system/ossConfig/types'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import { addOssConfig, changeOssConfigStatus, delOssConfig, getOssConfig, listOssConfig, updateOssConfig } from '@/api/modules/system/ossConfig'
import RightToolbar from '@/components/RuoYi/RightToolbar/index.vue'
import { useDict } from '@/composables/useDict'

defineOptions({
  name: 'OssConfig',
})

const { confirm } = useFaModal()
const { success } = useFaToast()
const { getDictOptions } = useDict()

const sysYesNoOptions = getDictOptions('sys_yes_no')

const pagedList = ref<OssConfigVO[]>([])
const buttonLoading = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const searchFold = ref(false)
const ids = ref<Array<number | string>>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)

const queryFormRef = ref<ElFormInstance>()
const ossConfigFormRef = ref<ElFormInstance>()

const dialog = reactive({
  visible: false,
  title: '',
})

const columns = ref([
  { key: 0, label: '主建', visible: false },
  { key: 1, label: '配置key', visible: true },
  { key: 2, label: '访问站点', visible: true },
  { key: 3, label: '自定义域名', visible: true },
  { key: 4, label: '桶名称', visible: true },
  { key: 5, label: '前缀', visible: true },
  { key: 6, label: '域', visible: true },
  { key: 7, label: '桶权限类型', visible: true },
  { key: 8, label: '状态', visible: true },
])

const initFormData: OssConfigForm = {
  ossConfigId: undefined,
  configKey: '',
  accessKey: '',
  secretKey: '',
  bucketName: '',
  prefix: '',
  endpoint: '',
  domain: '',
  isHttps: 'N',
  accessPolicy: '1',
  region: '',
  status: '1',
  remark: '',
}

const form = reactive<OssConfigForm>({ ...initFormData })

const queryParams = reactive<OssConfigQuery>({
  pageNum: 1,
  pageSize: 10,
  configKey: '',
  bucketName: '',
  status: '',
})

const rules = {
  configKey: [{ required: true, message: 'configKey不能为空', trigger: 'blur' }],
  accessKey: [
    { required: true, message: 'accessKey不能为空', trigger: 'blur' },
    { min: 2, max: 200, message: 'accessKey长度必须介于 2 和 100 之间', trigger: 'blur' },
  ],
  secretKey: [
    { required: true, message: 'secretKey不能为空', trigger: 'blur' },
    { min: 2, max: 100, message: 'secretKey长度必须介于 2 和 100 之间', trigger: 'blur' },
  ],
  bucketName: [
    { required: true, message: 'bucketName不能为空', trigger: 'blur' },
    { min: 2, max: 100, message: 'bucketName长度必须介于 2 和 100 之间', trigger: 'blur' },
  ],
  endpoint: [
    { required: true, message: 'endpoint不能为空', trigger: 'blur' },
    { min: 2, max: 100, message: 'endpoint名称长度必须介于 2 和 100 之间', trigger: 'blur' },
  ],
  accessPolicy: [{ required: true, message: 'accessPolicy不能为空', trigger: 'blur' }],
}

const protocol = computed(() => (form.isHttps === 'Y' ? 'https://' : 'http://'))

async function getList() {
  loading.value = true
  try {
    const res = await listOssConfig(queryParams)
    pagedList.value = res.rows
    total.value = res.total
  }
  finally {
    loading.value = false
  }
}

function cancel() {
  dialog.visible = false
  reset()
}

function reset() {
  Object.assign(form, initFormData)
  ossConfigFormRef.value?.resetFields()
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryFormRef.value?.resetFields()
  handleQuery()
}

function handleSelectionChange(selection: OssConfigVO[]) {
  ids.value = selection.map(item => item.ossConfigId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  dialog.visible = true
  dialog.title = '添加对象存储配置'
}

async function handleUpdate(row?: OssConfigVO) {
  reset()
  const ossConfigId = row?.ossConfigId || ids.value[0]
  const res = await getOssConfig(ossConfigId)
  Object.assign(form, res.data)
  dialog.visible = true
  dialog.title = '修改对象存储配置'
}

function submitForm() {
  ossConfigFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true
      try {
        if (form.ossConfigId) {
          await updateOssConfig(form)
        }
        else {
          await addOssConfig(form)
        }
        success('新增成功')
        dialog.visible = false
        getList()
      }
      finally {
        buttonLoading.value = false
      }
    }
  })
}

async function handleStatusChange(row: OssConfigVO) {
  const text = row.status === '0' ? '启用' : '停用'
  try {
    await confirm({
      title: '系统提示',
      content: `确认要"${text}""${row.configKey}"配置吗?`,
      type: 'warning',
    })
    await changeOssConfigStatus(row.ossConfigId, row.status, row.configKey)
    getList()
    success(`${text}成功`)
  }
  catch {
    return
  }
  finally {
    row.status = row.status === '0' ? '1' : '0'
  }
}

async function handleDelete(row?: OssConfigVO) {
  const ossConfigIds = row?.ossConfigId || ids.value
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认删除OSS配置编号为"${ossConfigIds}"的数据项?`,
      type: 'warning',
    })
    loading.value = true
    await delOssConfig(ossConfigIds)
    getList()
    success('删除成功')
  }
  catch {
    // 用户取消
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>

<template>
  <FaPageMain>
    <FaSearchBar v-model:fold="searchFold" :show-toggle="true" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="配置key" prop="configKey">
          <el-input v-model="queryParams.configKey" placeholder="配置key" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="桶名称" prop="bucketName">
          <el-input v-model="queryParams.bucketName" placeholder="请输入桶名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="是否默认" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option key="0" label="是" value="0" />
            <el-option key="1" label="否" value="1" />
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
        <FaButton v-hasPermi="['system:ossConfig:add']" @click="handleAdd">
          <FaIcon name="i-lucide:plus" class="mr-1" /> 新增
        </FaButton>
        <FaButton v-hasPermi="['system:ossConfig:edit']" variant="secondary" :disabled="single" @click="handleUpdate()">
          <FaIcon name="i-lucide:edit" class="mr-1" /> 修改
        </FaButton>
        <FaButton v-hasPermi="['system:ossConfig:remove']" variant="destructive" :disabled="multiple" @click="handleDelete()">
          <FaIcon name="i-lucide:trash-2" class="mr-1" /> 删除
        </FaButton>
      </div>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </div>

    <el-table v-loading="loading" border :data="pagedList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column v-if="columns[0].visible" label="主建" align="center" prop="ossConfigId" />
      <el-table-column v-if="columns[1].visible" label="配置key" align="center" prop="configKey" />
      <el-table-column v-if="columns[2].visible" label="访问站点" align="center" prop="endpoint" width="200" />
      <el-table-column v-if="columns[3].visible" label="自定义域名" align="center" prop="domain" width="200" />
      <el-table-column v-if="columns[4].visible" label="桶名称" align="center" prop="bucketName" />
      <el-table-column v-if="columns[5].visible" label="前缀" align="center" prop="prefix" />
      <el-table-column v-if="columns[6].visible" label="域" align="center" prop="region" />
      <el-table-column v-if="columns[7].visible" label="桶权限类型" align="center" prop="accessPolicy">
        <template #default="scope">
          <el-tag v-if="scope.row.accessPolicy === '0'" type="warning">
            private
          </el-tag>
          <el-tag v-if="scope.row.accessPolicy === '1'" type="success">
            public
          </el-tag>
          <el-tag v-if="scope.row.accessPolicy === '2'" type="info">
            custom
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="columns[8].visible" label="是否默认" align="center" prop="status">
        <template #default="scope">
          <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="center" width="150" class-name="small-padding">
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button v-hasPermi="['system:ossConfig:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button v-hasPermi="['system:ossConfig:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <FaPagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:size="queryParams.pageSize" :total="total" class="mt-4" @page-change="getList" @size-change="getList" />

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="800px" append-to-body>
      <el-form ref="ossConfigFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="配置key" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入配置key" />
        </el-form-item>
        <el-form-item label="访问站点" prop="endpoint">
          <el-input v-model="form.endpoint" placeholder="请输入访问站点">
            <template #prefix>
              <span style="color: #999;">{{ protocol }}</span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="自定义域名" prop="domain">
          <el-input v-model="form.domain" placeholder="请输入自定义域名">
            <template #prefix>
              <span style="color: #999;">{{ protocol }}</span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="accessKey" prop="accessKey">
          <el-input v-model="form.accessKey" placeholder="请输入accessKey" />
        </el-form-item>
        <el-form-item label="secretKey" prop="secretKey">
          <el-input v-model="form.secretKey" placeholder="请输入秘钥" show-password />
        </el-form-item>
        <el-form-item label="桶名称" prop="bucketName">
          <el-input v-model="form.bucketName" placeholder="请输入桶名称" />
        </el-form-item>
        <el-form-item label="前缀" prop="prefix">
          <el-input v-model="form.prefix" placeholder="请输入前缀" />
        </el-form-item>
        <el-form-item label="是否HTTPS">
          <el-radio-group v-model="form.isHttps">
            <el-radio v-for="dict in sysYesNoOptions" :key="dict.value" :value="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="桶权限类型">
          <el-radio-group v-model="form.accessPolicy">
            <el-radio value="0">
              private
            </el-radio>
            <el-radio value="1">
              public
            </el-radio>
            <el-radio value="2">
              custom
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="域" prop="region">
          <el-input v-model="form.region" placeholder="请输入域" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
