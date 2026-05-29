<script setup lang="ts">
import type { LoginInfoQuery, LoginInfoVO } from '@/api/modules/monitor/loginInfo/types'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import { cleanLoginInfo, delLoginInfo, list, unlockLoginInfo } from '@/api/modules/monitor/loginInfo'
import DictTag from '@/components/RuoYi/DictTag/index.vue'
import RightToolbar from '@/components/RuoYi/RightToolbar/index.vue'
import { useDict } from '@/composables/useDict'
import { download } from '@/utils/download'

defineOptions({
  name: 'Logininfor',
})

// Hooks
const { confirm } = useFaModal()
const { success } = useFaToast()
const { getDictOptions, parseTime } = useDict()

// 字典数据
const sysDeviceTypeOptions = getDictOptions('sys_device_type')
const sysCommonStatusOptions = getDictOptions('sys_common_status')

// 状态
const loading = ref(false)
const pagedList = ref<LoginInfoVO[]>([])
const total = ref(0)
const selectedIds = ref<Array<number | string>>([])
const selectedNames = ref<Array<string>>([])
const showSearch = ref(true)
const searchFold = ref(false)
const dateRange = ref<[string, string]>(['', ''])
const defaultSort = ref({ prop: 'loginTime', order: 'descending' })

// Refs
const queryFormRef = ref<ElFormInstance>()
const loginInfoTableRef = ref<ElTableInstance>()

// 查询参数
const queryParams = reactive<LoginInfoQuery>({
  pageNum: 1,
  pageSize: 10,
  ipaddr: '',
  userName: '',
  status: '',
  orderByColumn: defaultSort.value.prop,
  isAsc: defaultSort.value.order,
})

/** 查询登录日志列表 */
async function getList() {
  loading.value = true
  try {
    const data = await list({
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
  queryParams.pageNum = 1
  loginInfoTableRef.value?.sort(defaultSort.value.prop, defaultSort.value.order)
}

/** 多选框选中数据 */
function handleSelectionChange(selection: LoginInfoVO[]) {
  selectedIds.value = selection.map(item => item.infoId!)
  selectedNames.value = selection.map(item => item.userName)
}

/** 排序触发事件 */
function handleSortChange(column: any) {
  queryParams.orderByColumn = column.prop
  queryParams.isAsc = column.order
  getList()
}

/** 删除按钮操作 */
async function handleDelete(row?: LoginInfoVO) {
  const infoIds = row?.infoId || selectedIds.value
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认删除访问编号为"${infoIds}"的数据项?`,
      type: 'warning',
    })
    await delLoginInfo(infoIds)
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
      content: '是否确认清空所有登录日志数据项?',
      type: 'warning',
    })
    await cleanLoginInfo()
    success('清空成功')
    getList()
  }
  catch {
    // 用户取消
  }
}

/** 解锁按钮操作 */
async function handleUnlock() {
  const usernames = selectedNames.value
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认解锁用户"${usernames}"?`,
      type: 'warning',
    })
    await unlockLoginInfo(usernames)
    success(`用户${usernames}解锁成功`)
  }
  catch {
    // 用户取消
  }
}

/** 导出按钮操作 */
function handleExport() {
  download('/monitor/logininfor/export', queryParams, `logininfor_${Date.now()}.xlsx`)
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
        <el-form-item label="登录地址" prop="ipaddr">
          <el-input v-model="queryParams.ipaddr" placeholder="请输入登录地址" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="登录状态" clearable>
            <el-option v-for="dict in sysCommonStatusOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="登录时间" style="width: 308px;">
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
        <FaButton
          v-auth="['monitor:logininfor:remove']"
          variant="destructive"
          :disabled="!selectedIds.length"
          @click="handleDelete()"
        >
          <FaIcon name="i-lucide:trash-2" class="mr-1" />
          删除
        </FaButton>
        <FaButton v-auth="['monitor:logininfor:remove']" variant="outline" @click="handleClean">
          <FaIcon name="i-lucide:alert-triangle" class="mr-1" />
          清空
        </FaButton>
        <FaButton
          v-auth="['monitor:logininfor:unlock']"
          variant="outline"
          :disabled="!selectedNames.length"
          @click="handleUnlock"
        >
          <FaIcon name="i-lucide:unlock" class="mr-1" />
          解锁
        </FaButton>
        <FaButton v-auth="['monitor:logininfor:export']" variant="outline" @click="handleExport">
          <FaIcon name="i-lucide:download" class="mr-1" />
          导出
        </FaButton>
      </div>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </div>

    <!-- 数据表格 -->
    <el-table
      ref="loginInfoTableRef"
      v-loading="loading"
      :data="pagedList"
      :default-sort="defaultSort"
      border
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="访问编号" align="center" prop="infoId" />
      <el-table-column
        label="用户名称"
        align="center"
        prop="userName"
        :show-overflow-tooltip="true"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column label="客户端" align="center" prop="clientKey" :show-overflow-tooltip="true" />
      <el-table-column label="设备类型" align="center">
        <template #default="scope">
          <DictTag :options="sysDeviceTypeOptions" :value="scope.row.deviceType" />
        </template>
      </el-table-column>
      <el-table-column label="地址" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
      <el-table-column label="登录地点" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
      <el-table-column label="操作系统" align="center" prop="os" :show-overflow-tooltip="true" />
      <el-table-column label="浏览器" align="center" prop="browser" :show-overflow-tooltip="true" />
      <el-table-column label="登录状态" align="center" prop="status">
        <template #default="scope">
          <DictTag :options="sysCommonStatusOptions" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center" prop="msg" :show-overflow-tooltip="true" />
      <el-table-column label="访问时间" align="center" prop="loginTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.loginTime) }}</span>
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
  </FaPageMain>
</template>
