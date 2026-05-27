<script setup lang="ts">
import type { SystemForm, SystemQuery, SystemVO } from '@/api/modules/system/hisSystem/types'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import { addSystem, delSystem, getSystem, listSystem, updateSystem } from '@/api/modules/system/hisSystem'
import { listMenu } from '@/api/modules/system/menu'
import DictTag from '@/components/RuoYi/DictTag/index.vue'
import RightToolbar from '@/components/RuoYi/RightToolbar/index.vue'
import { useDict } from '@/composables/useDict'
import { download } from '@/utils/download'

defineOptions({
  name: 'HisSystem',
})

const { confirm } = useFaModal()
const { success } = useFaToast()
const { getDictOptions, parseTime } = useDict()

const historySystemTypeOptions = getDictOptions('history_system_type')

const pagedList = ref<SystemVO[]>([])
const buttonLoading = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const searchFold = ref(false)
const ids = ref<Array<string | number>>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)

const queryFormRef = ref<ElFormInstance>()
const systemFormRef = ref<ElFormInstance>()

const dialog = reactive({
  visible: false,
  title: '',
})

const initFormData: SystemForm = {
  id: undefined,
  vendorName: undefined,
  systemCode: undefined,
  systemName: undefined,
  startDate: undefined,
  endDate: undefined,
  status: 0,
  sort: undefined,
  systemTypeId: undefined,
  dateRange: [],
  menuId: undefined,
}

const form = reactive<SystemForm>({ ...initFormData })

const systemData = ref<any[]>([])

const queryParams = reactive<SystemQuery>({
  pageNum: 1,
  pageSize: 10,
  systemTypeId: '',
})

const rules = {
  systemTypeId: [{ required: true, message: '系统分类不能为空', trigger: 'blur' }],
  vendorName: [{ required: true, message: '厂商名称不能为空', trigger: 'blur' }],
  systemCode: [{ required: true, message: '系统编码不能为空', trigger: 'blur' }],
  systemName: [{ required: true, message: '系统名称不能为空', trigger: 'blur' }],
  dateRange: [{ required: true, message: '日期范围不能为空', trigger: 'change' }],
  menuId: [{ required: true, message: '绑定系统不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
}

function getMenu(path: string) {
  listMenu({ systemCode: 'history', path }).then((res: any) => {
    systemData.value = res.data
  })
}

async function getList() {
  loading.value = true
  try {
    const res = await listSystem(queryParams)
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
  systemFormRef.value?.resetFields()
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryFormRef.value?.resetFields()
  handleQuery()
}

function dateRangeChange(value: any) {
  form.startDate = value[0]
  form.endDate = value[1]
}

function handleSelectionChange(selection: SystemVO[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  dialog.visible = true
  dialog.title = '添加历史系统管理'
}

async function handleUpdate(row?: SystemVO) {
  reset()
  const _id = row?.id || ids.value[0]
  const res = await getSystem(_id)
  Object.assign(form, res.data)
  form.dateRange = [form.startDate, form.endDate]
  dialog.visible = true
  dialog.title = '修改历史系统管理'
  getMenu(String(form.systemTypeId))
}

function submitForm() {
  systemFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true
      try {
        if (form.id) {
          await updateSystem(form)
        }
        else {
          await addSystem(form)
        }
        success('操作成功')
        dialog.visible = false
        getList()
      }
      finally {
        buttonLoading.value = false
      }
    }
  })
}

async function handleDelete(row?: SystemVO) {
  const _ids = row?.id || ids.value
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认删除历史系统管理编号为"${_ids}"的数据项？`,
      type: 'warning',
    })
    await delSystem(_ids)
    success('删除成功')
    getList()
  }
  catch {
    // 用户取消
  }
}

function handleExport() {
  download('/system/his/system/export', { ...queryParams }, `system_${Date.now()}.xlsx`)
}

watch(
  () => form.systemTypeId,
  (val) => {
    if (val) {
      getMenu(String(val))
    }
  },
)

onMounted(() => {
  getList()
})
</script>

<template>
  <FaPageMain>
    <FaSearchBar v-model:fold="searchFold" :show-toggle="true" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="系统分类" prop="systemTypeId">
          <el-select v-model="queryParams.systemTypeId" clearable>
            <el-option v-for="item in historySystemTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
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
        <FaButton v-hasPermi="['system:system:add']" @click="handleAdd">
          <FaIcon name="i-lucide:plus" class="mr-1" /> 新增
        </FaButton>
        <FaButton v-hasPermi="['system:system:edit']" variant="secondary" :disabled="single" @click="handleUpdate()">
          <FaIcon name="i-lucide:edit" class="mr-1" /> 修改
        </FaButton>
        <FaButton v-hasPermi="['system:system:remove']" variant="destructive" :disabled="multiple" @click="handleDelete()">
          <FaIcon name="i-lucide:trash-2" class="mr-1" /> 删除
        </FaButton>
        <FaButton v-hasPermi="['system:system:export']" variant="outline" @click="handleExport">
          <FaIcon name="i-lucide:download" class="mr-1" /> 导出
        </FaButton>
      </div>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </div>

    <el-table v-loading="loading" border :data="pagedList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="系统分类" align="center" prop="systemTypeId">
        <template #default="scope">
          <DictTag :options="historySystemTypeOptions" :value="scope.row.systemTypeId" />
        </template>
      </el-table-column>
      <el-table-column label="厂商名称" align="center" prop="vendorName" />
      <el-table-column label="系统名称" align="center" prop="systemName" />
      <el-table-column label="开始年月" align="center" prop="startDate">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startDate, '{y}-{m}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束年月" align="center" prop="endDate">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endDate, '{y}-{m}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button v-hasPermi="['system:system:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button v-hasPermi="['system:system:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <FaPagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:size="queryParams.pageSize" :total="total" class="mt-4" @page-change="getList" @size-change="getList" />

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="700px" append-to-body>
      <el-form ref="systemFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="系统分类" prop="systemTypeId">
          <el-select v-model="form.systemTypeId" placeholder="请选择系统分类">
            <el-option v-for="item in historySystemTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="厂商名称" prop="vendorName">
          <el-input v-model="form.vendorName" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="系统编码" prop="systemCode">
          <el-input v-model="form.systemCode" placeholder="请输入系统编码" />
        </el-form-item>
        <el-form-item label="系统名称" prop="systemName">
          <el-input v-model="form.systemName" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="绑定系统" prop="menuId">
          <el-select v-model="form.menuId" placeholder="请选择绑定系统">
            <el-option v-for="item in systemData" :key="item.menuId" :label="item.menuName" :value="item.menuId" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始结束年月" prop="dateRange">
          <el-date-picker
            v-model="form.dateRange"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM"
            value-format="YYYY-MM"
            @change="dateRangeChange"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序" />
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
