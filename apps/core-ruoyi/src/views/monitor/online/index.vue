<script setup lang="ts">
import type { ElFormInstance } from '#/element-plus'
import type { OnlineQuery, OnlineVO } from '@/api/modules/monitor/online/types'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import { forceLogout, list } from '@/api/modules/monitor/online'
import DictTag from '@/components/RuoYi/DictTag/index.vue'
import { useDict } from '@/composables/useDict'

defineOptions({
  name: 'Online',
})

// Hooks
const { confirm, toast } = useFaModal()
const { success } = useFaToast()
const { getDictOptions, parseTime } = useDict()

// 字典数据
const sysDeviceTypeOptions = getDictOptions('sys_device_type')

// 状态
const loading = ref(false)
const pagedList = ref<OnlineVO[]>([])
const total = ref(0)
const searchFold = ref(false)

// Refs
const queryFormRef = ref<ElFormInstance>()

// 查询参数
const queryParams = reactive<OnlineQuery>({
  pageNum: 1,
  pageSize: 10,
  ipaddr: '',
  userName: '',
})

/** 查询在线用户列表 */
async function getList() {
  loading.value = true
  try {
    const data = await list(queryParams)
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
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 强退按钮操作 */
async function handleForceLogout(row: OnlineVO) {
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认强退名称为"${row.userName}"的用户?`,
      type: 'warning',
    })
    await forceLogout(row.tokenId)
    success('强退成功')
    getList()
  }
  catch {
    // 用户取消
  }
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

    <!-- 数据表格 -->
    <el-table v-loading="loading" border :data="pagedList">
      <el-table-column label="序号" width="50" type="index" align="center">
        <template #default="scope">
          <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会话编号" align="center" prop="tokenId" :show-overflow-tooltip="true" />
      <el-table-column label="登录名称" align="center" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column label="客户端" align="center" prop="clientKey" :show-overflow-tooltip="true" />
      <el-table-column label="设备类型" align="center">
        <template #default="scope">
          <DictTag :options="sysDeviceTypeOptions" :value="scope.row.deviceType" />
        </template>
      </el-table-column>
      <el-table-column label="所属部门" align="center" prop="deptName" :show-overflow-tooltip="true" />
      <el-table-column label="主机" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
      <el-table-column label="登录地点" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
      <el-table-column label="操作系统" align="center" prop="os" :show-overflow-tooltip="true" />
      <el-table-column label="浏览器" align="center" prop="browser" :show-overflow-tooltip="true" />
      <el-table-column label="登录时间" align="center" prop="loginTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.loginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <FaButton
            v-hasPermi="['monitor:online:forceLogout']"
            variant="destructive"
            size="sm"
            @click="handleForceLogout(scope.row)"
          >
            <FaIcon name="i-lucide:log-out" class="mr-1" />
            强退
          </FaButton>
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
    />
  </FaPageMain>
</template>
