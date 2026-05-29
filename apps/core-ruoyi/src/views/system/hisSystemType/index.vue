<script setup lang="ts">
import type { SystemTypeForm, SystemTypeQuery, SystemTypeVO } from '@/api/modules/system/hisSystemType/types'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import { addSystemType, delSystemType, getSystemType, listSystemType, updateSystemType } from '@/api/modules/system/hisSystemType'
import { listMenu as listMenuList } from '@/api/modules/system/menu'
import RightToolbar from '@/components/RuoYi/RightToolbar/index.vue'
import { download } from '@/utils/download'

defineOptions({
  name: 'SystemType',
})

const { confirm } = useFaModal()
const { success } = useFaToast()

const router = useRouter()

const pagedList = ref<SystemTypeVO[]>([])
const buttonLoading = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const searchFold = ref(false)
const ids = ref<Array<string | number>>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)

const queryFormRef = ref<ElFormInstance>()
const systemTypeFormRef = ref<ElFormInstance>()

const dialog = reactive({
  visible: false,
  title: '',
})

const initFormData: SystemTypeForm = {
  id: undefined,
  typeName: undefined,
  systemCode: undefined,
  systemBind: undefined,
  status: 0,
  sort: undefined,
}

const form = reactive<SystemTypeForm>({ ...initFormData })

const queryParams = reactive<SystemTypeQuery>({
  pageNum: 1,
  pageSize: 10,
  typeName: undefined,
  systemCode: undefined,
  systemBind: undefined,
  status: undefined,
  sort: undefined,
  params: {},
})

const rules = {
  id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
  typeName: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
  systemCode: [{ required: true, message: '分类标识不能为空', trigger: 'blur' }],
  systemBind: [{ required: true, message: '绑定系统不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }],
}

async function getList() {
  loading.value = true
  try {
    const res = await listSystemType(queryParams)
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
  systemTypeFormRef.value?.resetFields()
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryFormRef.value?.resetFields()
  handleQuery()
}

function vendorManagement(row: SystemTypeVO) {
  router.push({
    path: '/system/hisSystem',
    query: { systemId: row.id, path: row.systemBindCode },
  })
}

const systemData = ref<unknown[]>([])
listMenuList({ systemCode: 'history' }).then((res) => {
  systemData.value = res.data as unknown[]
})

function handleSelectionChange(selection: SystemTypeVO[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  dialog.visible = true
  dialog.title = '添加历史系统分类管理'
}

async function handleUpdate(row?: SystemTypeVO) {
  reset()
  const _id = row?.id || ids.value[0]
  const res = await getSystemType(_id)
  Object.assign(form, res.data)
  dialog.visible = true
  dialog.title = '修改历史系统分类管理'
}

function submitForm() {
  systemTypeFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true
      try {
        if (form.id) {
          await updateSystemType(form)
        }
        else {
          await addSystemType(form)
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

async function handleDelete(row?: SystemTypeVO) {
  const _ids = row?.id || ids.value
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认删除历史系统分类管理编号为"${_ids}"的数据项？`,
      type: 'warning',
    })
    await delSystemType(_ids)
    success('删除成功')
    getList()
  }
  catch {
    // 用户取消
  }
}

function handleExport() {
  download('/system/his/systemType/export', { ...queryParams }, `systemType_${Date.now()}.xlsx`)
}

onMounted(() => {
  getList()
})
</script>

<template>
  <FaPageMain>
    <FaSearchBar v-model:fold="searchFold" :show-toggle="true" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="分类名称" prop="typeName">
          <el-input v-model="queryParams.typeName" placeholder="请输入分类名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="分类标识" prop="systemCode">
          <el-input v-model="queryParams.systemCode" placeholder="请输入分类标识" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="绑定系统" prop="systemBind">
          <el-input v-model="queryParams.systemBind" placeholder="请输入绑定系统" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="queryParams.sort" placeholder="请输入排序" clearable @keyup.enter="handleQuery" />
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
        <FaButton v-hasPermi="['system:systemType:add']" @click="handleAdd">
          <FaIcon name="i-lucide:plus" class="mr-1" /> 新增
        </FaButton>
        <FaButton v-hasPermi="['system:systemType:edit']" variant="secondary" :disabled="single" @click="handleUpdate()">
          <FaIcon name="i-lucide:edit" class="mr-1" /> 修改
        </FaButton>
        <FaButton v-hasPermi="['system:systemType:remove']" variant="destructive" :disabled="multiple" @click="handleDelete()">
          <FaIcon name="i-lucide:trash-2" class="mr-1" /> 删除
        </FaButton>
        <FaButton v-hasPermi="['system:systemType:export']" variant="outline" @click="handleExport">
          <FaIcon name="i-lucide:download" class="mr-1" /> 导出
        </FaButton>
      </div>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </div>

    <el-table v-loading="loading" border :data="pagedList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="分类名称" align="center" prop="typeName" />
      <el-table-column label="分类标识" align="center" prop="systemCode" />
      <el-table-column label="绑定系统" align="center" prop="systemBindName" />
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="历史系统版本管理" placement="top">
            <el-button v-hasPermi="['system:systemType:edit']" link type="primary" icon="Plus" @click="vendorManagement(scope.row)" />
          </el-tooltip>
          <el-tooltip content="修改" placement="top">
            <el-button v-hasPermi="['system:systemType:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button v-hasPermi="['system:systemType:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <FaPagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:size="queryParams.pageSize" :total="total" class="mt-4" @page-change="getList" @size-change="getList" />

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="systemTypeFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="typeName">
          <el-input v-model="form.typeName" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="分类标识" prop="systemCode">
          <el-input v-model="form.systemCode" placeholder="请输入分类标识" />
        </el-form-item>
        <el-form-item label="绑定系统" prop="systemBind">
          <el-select v-model="form.systemBind" placeholder="请选择绑定系统">
            <el-option v-for="item in systemData" :key="item.menuId" :label="item.menuName" :value="item.menuId" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
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
