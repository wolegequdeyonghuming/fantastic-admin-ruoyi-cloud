<script setup lang="ts">
import type { ConfigForm, ConfigQuery, ConfigVO } from '@/api/modules/system/config/types'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import {
  addConfig,
  delConfig,
  getConfig,
  listConfig,
  refreshCache,
  updateConfig,
} from '@/api/modules/system/config'
import DictTag from '@/components/RuoYi/DictTag/index.vue'
import RightToolbar from '@/components/RuoYi/RightToolbar/index.vue'
import { useDict } from '@/composables/useDict'
import { download } from '@/utils/download'

defineOptions({
  name: 'Config',
})

// Hooks
const { confirm } = useFaModal()
const { success } = useFaToast()
const { getDictOptions, parseTime } = useDict()

// 字典数据
const sysYesNoOptions = getDictOptions('sys_yes_no')

// 状态
const loading = ref(false)
const pagedList = ref<ConfigVO[]>([])
const total = ref(0)
const showSearch = ref(true)
const searchFold = ref(false)
const ids = ref<Array<number | string>>([])
const single = ref(true)
const multiple = ref(true)
const dateRange = ref<[string, string]>(['', ''])

// Refs
const queryFormRef = ref<ElFormInstance>()
const configFormRef = ref<ElFormInstance>()

// 查询参数
const queryParams = reactive<ConfigQuery>({
  pageNum: 1,
  pageSize: 10,
  configName: '',
  configKey: '',
  configType: '',
})

// 表单数据
const dialog = reactive({
  visible: false,
  title: '',
})

const initFormData: ConfigForm = {
  configId: undefined,
  configName: '',
  configKey: '',
  configValue: '',
  configType: 'Y',
  remark: '',
}

const form = reactive<ConfigForm>({ ...initFormData })

const rules = {
  configName: [
    { required: true, message: '参数名称不能为空', trigger: 'blur' },
  ],
  configKey: [
    { required: true, message: '参数键名不能为空', trigger: 'blur' },
  ],
  configValue: [
    { required: true, message: '参数键值不能为空', trigger: 'blur' },
  ],
}

/** 查询参数列表 */
async function getList() {
  loading.value = true
  try {
    const data = await listConfig({
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
function handleSelectionChange(selection: ConfigVO[]) {
  ids.value = selection.map(item => item.configId!)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  dialog.title = '添加参数'
  dialog.visible = true
}

/** 修改按钮操作 */
async function handleUpdate(row?: ConfigVO) {
  reset()
  const configId = row?.configId || ids.value[0]
  const res = await getConfig(configId)
  Object.assign(form, res.data)
  dialog.title = '修改参数'
  dialog.visible = true
}

/** 表单重置 */
function reset() {
  Object.assign(form, initFormData)
  configFormRef.value?.resetFields()
}

/** 取消按钮 */
function cancel() {
  reset()
  dialog.visible = false
}

/** 提交按钮 */
function submitForm() {
  configFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (form.configId) {
        await updateConfig(form)
      }
      else {
        await addConfig(form)
      }
      success('操作成功')
      dialog.visible = false
      getList()
    }
  })
}

/** 删除按钮操作 */
async function handleDelete(row?: ConfigVO) {
  const configIds = row?.configId || ids.value
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认删除参数编号为"${configIds}"的数据项？`,
      type: 'warning',
    })
    await delConfig(configIds)
    success('删除成功')
    getList()
  }
  catch {
    // 用户取消
  }
}

/** 导出按钮操作 */
function handleExport() {
  download('/system/config/export', queryParams, `config_${Date.now()}.xlsx`)
}

/** 刷新缓存按钮操作 */
async function handleRefreshCache() {
  await refreshCache()
  success('刷新缓存成功')
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
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="queryParams.configName" placeholder="请输入参数名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="queryParams.configKey" placeholder="请输入参数键名" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="系统内置" prop="configType">
          <el-select v-model="queryParams.configType" placeholder="系统内置" clearable>
            <el-option v-for="dict in sysYesNoOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
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
        <FaButton v-hasPermi="['system:config:add']" @click="handleAdd">
          <FaIcon name="i-lucide:plus" class="mr-1" />
          新增
        </FaButton>
        <FaButton v-hasPermi="['system:config:edit']" variant="secondary" :disabled="single" @click="handleUpdate()">
          <FaIcon name="i-lucide:edit" class="mr-1" />
          修改
        </FaButton>
        <FaButton v-hasPermi="['system:config:remove']" variant="destructive" :disabled="multiple" @click="handleDelete()">
          <FaIcon name="i-lucide:trash-2" class="mr-1" />
          删除
        </FaButton>
        <FaButton v-hasPermi="['system:config:export']" variant="outline" @click="handleExport">
          <FaIcon name="i-lucide:download" class="mr-1" />
          导出
        </FaButton>
        <FaButton v-hasPermi="['system:config:remove']" variant="outline" @click="handleRefreshCache">
          <FaIcon name="i-lucide:refresh-cw" class="mr-1" />
          刷新缓存
        </FaButton>
      </div>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </div>

    <!-- 数据表格 -->
    <el-table v-loading="loading" border :data="pagedList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="参数名称" align="center" prop="configName" :show-overflow-tooltip="true" />
      <el-table-column label="参数键名" align="center" prop="configKey" :show-overflow-tooltip="true" />
      <el-table-column label="参数键值" align="center" prop="configValue" :show-overflow-tooltip="true" />
      <el-table-column label="系统内置" align="center" prop="configType">
        <template #default="scope">
          <DictTag :options="sysYesNoOptions" :value="scope.row.configType" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button v-hasPermi="['system:config:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button v-hasPermi="['system:config:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
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
      <el-form ref="configFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入参数键名" />
        </el-form-item>
        <el-form-item label="参数键值" prop="configValue">
          <el-input v-model="form.configValue" type="textarea" placeholder="请输入参数键值" />
        </el-form-item>
        <el-form-item label="系统内置" prop="configType">
          <el-radio-group v-model="form.configType">
            <el-radio v-for="dict in sysYesNoOptions" :key="dict.value" :value="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
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
