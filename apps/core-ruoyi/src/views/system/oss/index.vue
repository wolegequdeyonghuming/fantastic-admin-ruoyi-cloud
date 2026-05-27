<script setup lang="ts">
import type { OssForm, OssQuery, OssVO } from '@/api/modules/system/oss/types'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import { getConfigKey, updateConfigByKey } from '@/api/modules/system/config'
import { delOss, listOss } from '@/api/modules/system/oss'
import ImagePreview from '@/components/RuoYi/ImagePreview/index.vue'
import RightToolbar from '@/components/RuoYi/RightToolbar/index.vue'
import { useDict } from '@/composables/useDict'

defineOptions({
  name: 'Oss',
})

const router = useRouter()
const { confirm } = useFaModal()
const { success } = useFaToast()
const { parseTime } = useDict()

const pagedList = ref<OssVO[]>([])
const showTable = ref(true)
const buttonLoading = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const searchFold = ref(false)
const ids = ref<Array<string | number>>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const type = ref(0)
const previewListResource = ref(true)
const dateRangeCreateTime = ref<string[]>(['', ''])

const dialog = reactive({
  visible: false,
  title: '',
})

const defaultSort = { prop: 'createTime', order: 'ascending' }

const queryFormRef = ref<ElFormInstance>()
const ossFormRef = ref<ElFormInstance>()

const initFormData: OssForm = {
  file: undefined,
}

const form = reactive<OssForm>({ ...initFormData })

const queryParams = reactive<OssQuery>({
  pageNum: 1,
  pageSize: 10,
  fileName: '',
  originalName: '',
  fileSuffix: '',
  createTime: '',
  service: '',
  orderByColumn: defaultSort.prop,
  isAsc: defaultSort.order,
})

const rules = {
  file: [{ required: true, message: '文件不能为空', trigger: 'blur' }],
}

async function getList() {
  loading.value = true
  try {
    const res = await getConfigKey('sys.oss.previewListResource')
    previewListResource.value = res?.data === undefined ? true : res.data === 'true'
    const params: any = { ...queryParams }
    if (dateRangeCreateTime.value[0]) {
      params.beginCreateTime = dateRangeCreateTime.value[0]
      params.endCreateTime = dateRangeCreateTime.value[1]
    }
    const response = await listOss(params)
    pagedList.value = response.rows
    total.value = response.total
  }
  finally {
    loading.value = false
    showTable.value = true
  }
}

function checkFileSuffix(fileSuffix: string | string[]) {
  const arr = ['.png', '.jpg', '.jpeg']
  const suffixArray = Array.isArray(fileSuffix) ? fileSuffix : [fileSuffix]
  return suffixArray.some(suffix => arr.includes(suffix.toLowerCase()))
}

function cancel() {
  reset()
  dialog.visible = false
}

function reset() {
  Object.assign(form, initFormData)
  ossFormRef.value?.resetFields()
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  showTable.value = false
  dateRangeCreateTime.value = ['', '']
  queryFormRef.value?.resetFields()
  queryParams.orderByColumn = defaultSort.prop
  queryParams.isAsc = defaultSort.order
  handleQuery()
}

function handleSelectionChange(selection: OssVO[]) {
  ids.value = selection.map(item => item.ossId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleHeaderClass({ column }: any): any {
  column.order = column.multiOrder
}

function handleHeaderCLick(column: any) {
  if (column.sortable !== 'custom') {
    return
  }
  switch (column.multiOrder) {
    case 'descending':
      column.multiOrder = 'ascending'
      break
    case 'ascending':
      column.multiOrder = ''
      break
    default:
      column.multiOrder = 'descending'
      break
  }
  handleOrderChange(column.property, column.multiOrder)
}

function handleOrderChange(prop: string, order: string) {
  const orderByArr = queryParams.orderByColumn
    ? queryParams.orderByColumn.split(',')
    : []
  const isAscArr = queryParams.isAsc
    ? queryParams.isAsc.split(',')
    : []
  const propIndex = orderByArr.indexOf(prop)
  if (propIndex !== -1) {
    if (order) {
      isAscArr[propIndex] = order
    }
    else {
      isAscArr.splice(propIndex, 1)
      orderByArr.splice(propIndex, 1)
    }
  }
  else {
    orderByArr.push(prop)
    isAscArr.push(order)
  }
  queryParams.orderByColumn = orderByArr.join(',')
  queryParams.isAsc = isAscArr.join(',')
  getList()
}

function handleOssConfig() {
  router.push('/system/oss-config/index')
}

function handleFile() {
  reset()
  type.value = 0
  dialog.visible = true
  dialog.title = '上传文件'
}

function handleImage() {
  reset()
  type.value = 1
  dialog.visible = true
  dialog.title = '上传图片'
}

function submitForm() {
  dialog.visible = false
  getList()
}

function handleDownload(row: OssVO) {
  window.open(`/system/oss/download/${row.ossId}`)
}

async function handlePreviewListResource(preview: boolean) {
  const text = preview ? '启用' : '停用'
  try {
    await confirm({
      title: '系统提示',
      content: `确认要"${text}""预览列表图片"配置吗?`,
      type: 'warning',
    })
    await updateConfigByKey('sys.oss.previewListResource', preview)
    await getList()
    success(`${text}成功`)
  }
  catch {
    // 用户取消
  }
}

async function handleDelete(row?: OssVO) {
  const ossIds = row?.ossId || ids.value
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认删除OSS对象存储编号为"${ossIds}"的数据项?`,
      type: 'warning',
    })
  }
  catch {
    return
  }
  loading.value = true
  await delOss(ossIds).finally(() => {
    loading.value = false
  })
  await getList()
  success('删除成功')
}

onMounted(() => {
  getList()
})
</script>

<template>
  <FaPageMain>
    <FaSearchBar v-model:fold="searchFold" :show-toggle="true" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="文件名" prop="fileName">
          <el-input v-model="queryParams.fileName" placeholder="请输入文件名" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="原名" prop="originalName">
          <el-input v-model="queryParams.originalName" placeholder="请输入原名" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="文件后缀" prop="fileSuffix">
          <el-input v-model="queryParams.fileSuffix" placeholder="请输入文件后缀" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="创建时间" style="width: 308px;">
          <el-date-picker
            v-model="dateRangeCreateTime"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
          />
        </el-form-item>
        <el-form-item label="服务商" prop="service">
          <el-input v-model="queryParams.service" placeholder="请输入服务商" clearable @keyup.enter="handleQuery" />
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
        <FaButton v-hasPermi="['system:oss:upload']" @click="handleFile">
          <FaIcon name="i-lucide:upload" class="mr-1" /> 上传文件
        </FaButton>
        <FaButton v-hasPermi="['system:oss:upload']" @click="handleImage">
          <FaIcon name="i-lucide:image" class="mr-1" /> 上传图片
        </FaButton>
        <FaButton v-hasPermi="['system:oss:remove']" variant="destructive" :disabled="multiple" @click="handleDelete()">
          <FaIcon name="i-lucide:trash-2" class="mr-1" /> 删除
        </FaButton>
        <FaButton
          v-hasPermi="['system:oss:edit']"
          :variant="previewListResource ? 'destructive' : 'warning'"
          @click="handlePreviewListResource(!previewListResource)"
        >
          预览开关 : {{ previewListResource ? '禁用' : '启用' }}
        </FaButton>
        <FaButton v-hasPermi="['system:ossConfig:list']" variant="outline" @click="handleOssConfig">
          <FaIcon name="i-lucide:settings" class="mr-1" /> 配置管理
        </FaButton>
      </div>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </div>

    <el-table
      v-if="showTable"
      v-loading="loading"
      border
      :data="pagedList"
      :header-cell-class-name="handleHeaderClass"
      @selection-change="handleSelectionChange"
      @header-click="handleHeaderCLick"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column v-if="false" label="对象存储主键" align="center" prop="ossId" />
      <el-table-column label="文件名" align="center" prop="fileName" />
      <el-table-column label="原名" align="center" prop="originalName" />
      <el-table-column label="文件后缀" align="center" prop="fileSuffix" />
      <el-table-column label="文件展示" align="center" prop="url">
        <template #default="scope">
          <ImagePreview
            v-if="previewListResource && checkFileSuffix(scope.row.fileSuffix)"
            :width="100"
            :height="100"
            :src="scope.row.url"
            :preview-src-list="[scope.row.url]"
          />
          <span v-else v-text="scope.row.url" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" sortable="custom">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上传人" align="center" prop="createByName" />
      <el-table-column label="服务商" align="center" prop="service" sortable="custom" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="下载" placement="top">
            <el-button v-hasPermi="['system:oss:download']" link type="primary" icon="Download" @click="handleDownload(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button v-hasPermi="['system:oss:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <FaPagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:size="queryParams.pageSize" :total="total" class="mt-4" @page-change="getList" @size-change="getList" />

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="ossFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="文件名">
          <fileUpload v-if="type === 0" v-model="form.file" />
          <imageUpload v-if="type === 1" v-model="form.file" />
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
