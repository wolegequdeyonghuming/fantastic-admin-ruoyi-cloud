<script setup lang="ts">
import type { DictTypeForm, DictTypeQuery, DictTypeVO } from '@/api/modules/system/dict/type/types'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import {
  addType,
  delType,
  getType,
  listType,
  refreshCache,
  updateType,
} from '@/api/modules/system/dict/type'
import RightToolbar from '@/components/RuoYi/RightToolbar/index.vue'
import { useDict } from '@/composables/useDict'
import { useDictStore } from '@/store/modules/app/dict'
import { download } from '@/utils/download'

defineOptions({
  name: 'Dict',
})

// Hooks
const { confirm } = useFaModal()
const { success: toastSuccess } = useFaToast()
const { parseTime } = useDict()

// 状态
const loading = ref(false)
const pagedList = ref<DictTypeVO[]>([])
const total = ref(0)
const showSearch = ref(true)
const searchFold = ref(false)
const ids = ref<Array<number | string>>([])
const single = ref(true)
const multiple = ref(true)
const dateRange = ref<[string, string]>(['', ''])

// Refs
const queryFormRef = ref<ElFormInstance>()
const dictFormRef = ref<ElFormInstance>()

// 查询参数
const queryParams = reactive<DictTypeQuery>({
  pageNum: 1,
  pageSize: 10,
  dictName: '',
  dictType: '',
})

// 表单数据
const dialog = reactive({
  visible: false,
  title: '',
})

const initFormData: DictTypeForm = {
  dictId: undefined,
  dictName: '',
  dictType: '',
  remark: '',
}

const form = reactive<DictTypeForm>({ ...initFormData })

const rules = {
  dictName: [
    { required: true, message: '字典名称不能为空', trigger: 'blur' },
  ],
  dictType: [
    { required: true, message: '字典类型不能为空', trigger: 'blur' },
  ],
}

/** 查询字典类型列表 */
async function getList() {
  loading.value = true
  try {
    const data = await listType({
      ...queryParams,
      params: {
        beginTime: dateRange.value[0],
        endTime: dateRange.value[1],
      },
    })
    pagedList.value = data.rows
    total.value = data.total
  }
  finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = ['', '']
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: DictTypeVO[]) {
  ids.value = selection.map(item => item.dictId!)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  dialog.title = '添加字典类型'
  dialog.visible = true
}

/** 修改按钮操作 */
async function handleUpdate(row?: DictTypeVO) {
  reset()
  const dictId = row?.dictId || ids.value[0]
  const res = await getType(dictId)
  Object.assign(form, res.data)
  dialog.title = '修改字典类型'
  dialog.visible = true
}

/** 表单重置 */
function reset() {
  Object.assign(form, initFormData)
  dictFormRef.value?.resetFields()
}

/** 取消按钮 */
function cancel() {
  reset()
  dialog.visible = false
}

/** 提交按钮 */
function submitForm() {
  dictFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (form.dictId) {
        await updateType(form)
      }
      else {
        await addType(form)
      }
      toastSuccess('操作成功')
      dialog.visible = false
      getList()
    }
  })
}

/** 删除按钮操作 */
async function handleDelete(row?: DictTypeVO) {
  const dictIds = row?.dictId || ids.value
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认删除字典编号为"${dictIds}"的数据项？`,
      type: 'warning',
    })
    await delType(dictIds)
    toastSuccess('删除成功')
    getList()
  }
  catch {
    // 用户取消
  }
}

/** 导出按钮操作 */
function handleExport() {
  download('/system/dict/type/export', queryParams, `dict_${Date.now()}.xlsx`)
}

/** 刷新缓存按钮操作 */
async function handleRefreshCache() {
  await refreshCache()
  toastSuccess('刷新成功')
  useDictStore().cleanDict()
}

onMounted(() => {
  getList()
})
</script>

<template>
  <FaPageMain>
    <!-- 搜索栏 -->
    <FaSearchBar v-model:fold="searchFold" :show-toggle="true" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="queryParams.dictName" placeholder="请输入字典名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="queryParams.dictType" placeholder="请输入字典类型" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="创建时间" style="width: 308px;">
          <el-date-picker
            v-model="dateRange"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </FaSearchBar>

    <!-- 操作栏 -->
    <div class="my-4 flex items-center justify-between">
      <div class="flex gap-2">
        <FaButton v-auth="['system:dict:add']" @click="handleAdd">
          <FaIcon name="i-lucide:plus" class="mr-1" />
          新增
        </FaButton>
        <FaButton v-auth="['system:dict:edit']" variant="secondary" :disabled="single" @click="handleUpdate()">
          <FaIcon name="i-lucide:edit" class="mr-1" />
          修改
        </FaButton>
        <FaButton v-auth="['system:dict:remove']" variant="destructive" :disabled="multiple" @click="handleDelete()">
          <FaIcon name="i-lucide:trash-2" class="mr-1" />
          删除
        </FaButton>
        <FaButton v-auth="['system:dict:export']" variant="outline" @click="handleExport">
          <FaIcon name="i-lucide:download" class="mr-1" />
          导出
        </FaButton>
        <FaButton v-auth="['system:dict:remove']" variant="outline" @click="handleRefreshCache">
          <FaIcon name="i-lucide:refresh-cw" class="mr-1" />
          刷新缓存
        </FaButton>
      </div>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </div>

    <!-- 数据表格 -->
    <el-table v-loading="loading" border :data="pagedList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="字典名称" align="center" prop="dictName" :show-overflow-tooltip="true" />
      <el-table-column label="字典类型" align="center" :show-overflow-tooltip="true">
        <template #default="scope">
          <router-link :to="`/system/dict-data/index/${scope.row.dictId}`" class="link-type">
            <span>{{ scope.row.dictType }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button v-auth="['system:dict:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button v-auth="['system:dict:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <FaPagination
      v-show="total > 0"
      v-model:page="queryParams.pageNum"
      v-model:size="queryParams.pageSize"
      :total="total"
      class="mt-4"
      @page-change="getList"
      @size-change="getList"
    />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="dictFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="form.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="form.dictType" placeholder="请输入字典类型" />
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

<style scoped>
.link-type {
  color: #409eff;
  text-decoration: none;
}

.link-type:hover {
  text-decoration: underline;
}
</style>
