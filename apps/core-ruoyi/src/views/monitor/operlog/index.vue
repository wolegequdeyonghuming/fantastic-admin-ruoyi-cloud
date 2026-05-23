<script setup lang="ts">
import type { ElFormInstance, ElTableInstance } from '#/element-plus'
import type { OperLogQuery, OperLogVO } from '@/api/modules/monitor/operlog/types'
import { cleanOperlog, delOperlog, list } from '@/api/modules/monitor/operlog'
import DictTag from '@/components/RuoYi/DictTag/index.vue'
import RightToolbar from '@/components/RuoYi/RightToolbar/index.vue'
import { useDict } from '@/composables/useDict'
import { download } from '@/utils/download'
import OperInfoDialog from './oper-info-dialog.vue'

defineOptions({
  name: 'Operlog',
})

// Hooks
const { confirm, toast } = useFaModal()
const { success } = useFaToast()
const { getDictOptions, parseTime } = useDict()

// 字典数据
const sysOperTypeOptions = getDictOptions('sys_oper_type')
const sysCommonStatusOptions = getDictOptions('sys_common_status')

// 状态
const loading = ref(false)
const operlogList = ref<OperLogVO[]>([])
const total = ref(0)
const selectedIds = ref<Array<number | string>>([])
const showSearch = ref(true)
const searchFold = ref(false)
const dateRange = ref<[string, string]>(['', ''])
const defaultSort = ref({ prop: 'operTime', order: 'descending' })

// Refs
const operLogTableRef = ref<ElTableInstance>()
const queryFormRef = ref<ElFormInstance>()
const operInfoDialogRef = ref<InstanceType<typeof OperInfoDialog>>()

// 查询参数
const queryParams = reactive<OperLogQuery>({
  pageNum: 1,
  pageSize: 10,
  operIp: '',
  title: '',
  operName: '',
  businessType: '',
  status: '',
  orderByColumn: defaultSort.value.prop,
  isAsc: defaultSort.value.order,
})

/** 查询操作日志列表 */
async function getList() {
  loading.value = true
  try {
    const { data } = await list({
      ...queryParams,
      params: {
        beginTime: dateRange.value[0],
        endTime: dateRange.value[1],
      },
    })
    operlogList.value = data.rows
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
  queryParams.pageNum = 1
  operLogTableRef.value?.sort(defaultSort.value.prop, defaultSort.value.order)
}

/** 多选框选中数据 */
function handleSelectionChange(selection: OperLogVO[]) {
  selectedIds.value = selection.map(item => item.operId!)
}

/** 排序触发事件 */
function handleSortChange(column: any) {
  queryParams.orderByColumn = column.prop
  queryParams.isAsc = column.order
  getList()
}

/** 详细按钮操作 */
function handleView(row: OperLogVO) {
  operInfoDialogRef.value?.openDialog(row)
}

/** 删除按钮操作 */
async function handleDelete(row?: OperLogVO) {
  const operIds = row?.operId || selectedIds.value
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认删除日志编号为"${operIds}"的数据项?`,
      type: 'warning',
    })
    await delOperlog(operIds)
    success('删除成功')
    getList()
  }
  catch {
    // 用户取消
  }
}

/** 清空按钮操作 */
async function handleClean() {
  try {
    await confirm({
      title: '系统提示',
      content: '是否确认清空所有操作日志数据项?',
      type: 'warning',
    })
    await cleanOperlog()
    success('清空成功')
    getList()
  }
  catch {
    // 用户取消
  }
}

/** 导出按钮操作 */
function handleExport() {
  download('/monitor/operlog/export', queryParams, `operlog_${Date.now()}.xlsx`)
}

onMounted(() => {
  getList()
})
</script>

<template>
  <FaPageMain title="操作日志">
    <!-- 搜索栏 -->
    <FaSearchBar v-model:fold="searchFold" :show-toggle="true">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="操作地址" prop="operIp">
          <el-input v-model="queryParams.operIp" placeholder="请输入操作地址" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="系统模块" prop="title">
          <el-input v-model="queryParams.title" placeholder="请输入系统模块" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="操作人员" prop="operName">
          <el-input v-model="queryParams.operName" placeholder="请输入操作人员" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="类型" prop="businessType">
          <el-select v-model="queryParams.businessType" placeholder="操作类型" clearable>
            <el-option v-for="dict in sysOperTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="操作状态" clearable>
            <el-option v-for="dict in sysCommonStatusOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间" style="width: 308px">
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
          <FaButton type="primary" @click="handleQuery">
            <FaIcon name="i-lucide:search" class="mr-1" />
            搜索
          </FaButton>
          <FaButton variant="outline" @click="resetQuery">
            <FaIcon name="i-lucide:rotate-ccw" class="mr-1" />
            重置
          </FaButton>
        </el-form-item>
      </el-form>
    </FaSearchBar>

    <!-- 操作栏 -->
    <div class="my-4 flex items-center justify-between">
      <div class="flex gap-2">
        <FaButton
          v-hasPermi="['monitor:operlog:remove']"
          variant="destructive"
          :disabled="!selectedIds.length"
          @click="handleDelete()"
        >
          <FaIcon name="i-lucide:trash-2" class="mr-1" />
          删除
        </FaButton>
        <FaButton v-hasPermi="['monitor:operlog:remove']" variant="outline" @click="handleClean">
          <FaIcon name="i-lucide:alert-triangle" class="mr-1" />
          清空
        </FaButton>
        <FaButton v-hasPermi="['monitor:operlog:export']" variant="outline" @click="handleExport">
          <FaIcon name="i-lucide:download" class="mr-1" />
          导出
        </FaButton>
      </div>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </div>

    <!-- 数据表格 -->
    <el-table
      ref="operLogTableRef"
      v-loading="loading"
      :data="operlogList"
      border
      :default-sort="defaultSort"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="日志编号" align="center" prop="operId" />
      <el-table-column label="系统模块" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="操作类型" align="center" prop="businessType">
        <template #default="scope">
          <DictTag :options="sysOperTypeOptions" :value="scope.row.businessType" />
        </template>
      </el-table-column>
      <el-table-column
        label="操作人员"
        align="center"
        width="110"
        prop="operName"
        :show-overflow-tooltip="true"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column label="部门" align="center" prop="deptName" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="操作地址" align="center" prop="operIp" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="操作状态" align="center" prop="status">
        <template #default="scope">
          <DictTag :options="sysCommonStatusOptions" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作日期" align="center" prop="operTime" width="180" sortable="custom" :sort-orders="['descending', 'ascending']">
        <template #default="scope">
          <span>{{ parseTime(scope.row.operTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="消耗时间"
        align="center"
        prop="costTime"
        width="110"
        :show-overflow-tooltip="true"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      >
        <template #default="scope">
          <span>{{ scope.row.costTime }}毫秒</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="详细" placement="top">
            <FaButton v-hasPermi="['monitor:operlog:query']" variant="ghost" size="icon" @click="handleView(scope.row)">
              <FaIcon name="i-lucide:eye" />
            </FaButton>
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

    <!-- 详情弹窗 -->
    <OperInfoDialog ref="operInfoDialogRef" />
  </FaPageMain>
</template>
