<script setup lang="ts">
import type { DictDataForm, DictDataQuery, DictDataVO } from '@/api/modules/system/dict/data/types'
import type { DictTypeVO } from '@/api/modules/system/dict/type/types'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import { addData, delData, getData, listData, updateData } from '@/api/modules/system/dict/data'
import { optionselect as getDictOptionselect, getType } from '@/api/modules/system/dict/type'
import RightToolbar from '@/components/RuoYi/RightToolbar/index.vue'
import { useDict } from '@/composables/useDict'
import { useDictStore } from '@/store/modules/app/dict'
import { download } from '@/utils/download'

defineOptions({
  name: 'DictData',
})

const route = useRoute()
const router = useRouter()

const { confirm } = useFaModal()
const { success: toastSuccess } = useFaToast()
const { parseTime } = useDict()

const pagedList = ref<DictDataVO[]>([])
const loading = ref(true)
const showSearch = ref(true)
const searchFold = ref(false)
const ids = ref<Array<string | number>>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const defaultDictType = ref('')
const typeOptions = ref<DictTypeVO[]>([])

const dataFormRef = ref<ElFormInstance>()
const queryFormRef = ref<ElFormInstance>()

const dialog = reactive({
  visible: false,
  title: '',
})

const listClassOptions = ref<Array<{ value: string, label: string }>>([
  { value: 'default', label: '默认' },
  { value: 'primary', label: '主要' },
  { value: 'success', label: '成功' },
  { value: 'info', label: '信息' },
  { value: 'warning', label: '警告' },
  { value: 'danger', label: '危险' },
])

const initFormData: DictDataForm = {
  dictCode: undefined,
  dictLabel: '',
  dictValue: '',
  cssClass: '',
  listClass: 'primary',
  dictSort: 0,
  remark: '',
}

const form = reactive<DictDataForm>({ ...initFormData })

const queryParams = reactive<DictDataQuery>({
  pageNum: 1,
  pageSize: 10,
  dictName: '',
  dictType: '',
  dictLabel: '',
})

const rules = {
  dictLabel: [
    { required: true, message: '数据标签不能为空', trigger: 'blur' },
  ],
  dictValue: [
    { required: true, message: '数据键值不能为空', trigger: 'blur' },
  ],
  dictSort: [
    { required: true, message: '数据顺序不能为空', trigger: 'blur' },
  ],
}

async function getTypes(dictId: string | number) {
  const { data } = await getType(dictId)
  queryParams.dictType = data.dictType
  defaultDictType.value = data.dictType
  getList()
}

async function getTypeList() {
  const res = await getDictOptionselect()
  typeOptions.value = res.data
}

async function getList() {
  loading.value = true
  try {
    const res = await listData(queryParams)
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
  dataFormRef.value?.resetFields()
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function handleClose() {
  router.push('/system/dict')
}

function resetQuery() {
  queryFormRef.value?.resetFields()
  queryParams.dictType = defaultDictType.value
  handleQuery()
}

function handleAdd() {
  reset()
  form.dictType = queryParams.dictType
  dialog.visible = true
  dialog.title = '添加字典数据'
}

function handleSelectionChange(selection: DictDataVO[]) {
  ids.value = selection.map(item => item.dictCode)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

async function handleUpdate(row?: DictDataVO) {
  reset()
  const dictCode = row?.dictCode || ids.value[0]
  const res = await getData(dictCode)
  Object.assign(form, res.data)
  dialog.visible = true
  dialog.title = '修改字典数据'
}

function submitForm() {
  dataFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (form.dictCode) {
        await updateData(form)
      }
      else {
        await addData(form)
      }
      useDictStore().removeDict(queryParams.dictType)
      toastSuccess('操作成功')
      dialog.visible = false
      getList()
    }
  })
}

async function handleDelete(row?: DictDataVO) {
  const dictCodes = row?.dictCode || ids.value
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认删除字典编码为"${dictCodes}"的数据项？`,
      type: 'warning',
    })
    await delData(dictCodes)
    getList()
    toastSuccess('删除成功')
    useDictStore().removeDict(queryParams.dictType)
  }
  catch {
    // 用户取消
  }
}

function handleExport() {
  download('/system/dict/data/export', { ...queryParams }, `dict_data_${Date.now()}.xlsx`)
}

onMounted(() => {
  getTypes(route.params && (route.params.dictId as string))
  getTypeList()
})
</script>

<template>
  <FaPageMain>
    <FaSearchBar v-model:fold="searchFold" :show-toggle="true" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="字典名称" prop="dictType">
          <el-select v-model="queryParams.dictType">
            <el-option v-for="item in typeOptions" :key="item.dictId" :label="item.dictName" :value="item.dictType" />
          </el-select>
        </el-form-item>
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="queryParams.dictLabel" placeholder="请输入字典标签" clearable @keyup.enter="handleQuery" />
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
        <FaButton v-hasPermi="['system:dict:add']" @click="handleAdd">
          <FaIcon name="i-lucide:plus" class="mr-1" /> 新增
        </FaButton>
        <FaButton v-hasPermi="['system:dict:edit']" variant="secondary" :disabled="single" @click="handleUpdate()">
          <FaIcon name="i-lucide:edit" class="mr-1" /> 修改
        </FaButton>
        <FaButton v-hasPermi="['system:dict:remove']" variant="destructive" :disabled="multiple" @click="handleDelete()">
          <FaIcon name="i-lucide:trash-2" class="mr-1" /> 删除
        </FaButton>
        <FaButton v-hasPermi="['system:dict:export']" variant="outline" @click="handleExport">
          <FaIcon name="i-lucide:download" class="mr-1" /> 导出
        </FaButton>
        <FaButton variant="outline" @click="handleClose">
          <FaIcon name="i-lucide:x" class="mr-1" /> 关闭
        </FaButton>
      </div>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </div>

    <el-table v-loading="loading" border :data="pagedList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column v-if="false" label="字典编码" align="center" prop="dictCode" />
      <el-table-column label="字典标签" align="center" prop="dictLabel">
        <template #default="scope">
          <span v-if="(scope.row.listClass === '' || scope.row.listClass === 'default') && (scope.row.cssClass === '' || scope.row.cssClass == null)">{{ scope.row.dictLabel }}</span>
          <el-tag v-else :type="scope.row.listClass === 'primary' || scope.row.listClass === 'default' ? 'primary' : scope.row.listClass" :class="scope.row.cssClass">
            {{ scope.row.dictLabel }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="字典键值" align="center" prop="dictValue" />
      <el-table-column label="字典排序" align="center" prop="dictSort" />
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button v-hasPermi="['system:dict:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button v-hasPermi="['system:dict:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <FaPagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:size="queryParams.pageSize" :total="total" class="mt-4" @page-change="getList" @size-change="getList" />

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="dataFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典类型">
          <el-input v-model="form.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item label="数据标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入数据标签" />
        </el-form-item>
        <el-form-item label="数据键值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入数据键值" />
        </el-form-item>
        <el-form-item label="样式属性" prop="cssClass">
          <el-input v-model="form.cssClass" placeholder="请输入样式属性" />
        </el-form-item>
        <el-form-item label="显示排序" prop="dictSort">
          <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="回显样式" prop="listClass">
          <el-select v-model="form.listClass">
            <el-option v-for="item in listClassOptions" :key="item.value" :label="`${item.label}(${item.value})`" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
  </FaPageMain>
</template>
