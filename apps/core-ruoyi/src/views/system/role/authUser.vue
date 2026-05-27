<script setup lang="ts">
import type { UserQuery, UserVO } from '@/api/modules/system/user/types'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import { allocatedUserList, authUserCancel, authUserCancelAll } from '@/api/modules/system/role'
import DictTag from '@/components/RuoYi/DictTag/index.vue'
import RightToolbar from '@/components/RuoYi/RightToolbar/index.vue'
import { useDict } from '@/composables/useDict'
import SelectUser from './selectUser.vue'

defineOptions({
  name: 'AuthUser',
})

const { confirm } = useFaModal()
const { success } = useFaToast()
const { getDictOptions } = useDict()

const sysNormalDisableOptions = getDictOptions('sys_normal_disable')

const route = useRoute()
const router = useRouter()

const pagedList = ref<UserVO[]>([])
const loading = ref(true)
const showSearch = ref(true)
const searchFold = ref(false)
const multiple = ref(true)
const total = ref(0)
const userIds = ref<Array<string | number>>([])

const queryFormRef = ref<ElFormInstance>()
const selectRef = ref<InstanceType<typeof SelectUser>>()

const queryParams = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 10,
  roleId: route.params.roleId as string,
  userName: undefined,
  phonenumber: undefined,
})

async function getList() {
  loading.value = true
  try {
    const res = await allocatedUserList(queryParams)
    pagedList.value = res.rows
    total.value = res.total
  }
  finally {
    loading.value = false
  }
}

function handleClose() {
  router.push('/system/role')
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryFormRef.value?.resetFields()
  handleQuery()
}

function handleSelectionChange(selection: UserVO[]) {
  userIds.value = selection.map(item => item.userId)
  multiple.value = !selection.length
}

function openSelectUser() {
  selectRef.value?.show()
}

async function cancelAuthUser(row: UserVO) {
  try {
    await confirm({
      title: '系统提示',
      content: `确认要取消该用户"${row.userName}"角色吗？`,
      type: 'warning',
    })
    await authUserCancel({ userId: row.userId, roleId: queryParams.roleId })
    await getList()
    success('取消授权成功')
  }
  catch {
    // 用户取消
  }
}

async function cancelAuthUserAll() {
  const roleId = queryParams.roleId
  const uIds = userIds.value.join(',')
  try {
    await confirm({
      title: '系统提示',
      content: '是否取消选中用户授权数据项?',
      type: 'warning',
    })
    await authUserCancelAll({ roleId, userIds: uIds })
    await getList()
    success('取消授权成功')
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
    <FaSearchBar v-model:fold="searchFold" :show-toggle="true" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable @keyup.enter="handleQuery" />
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
        <FaButton v-hasPermi="['system:role:add']" @click="openSelectUser">
          <FaIcon name="i-lucide:plus" class="mr-1" /> 添加用户
        </FaButton>
        <FaButton v-hasPermi="['system:role:remove']" variant="destructive" :disabled="multiple" @click="cancelAuthUserAll">
          <FaIcon name="i-lucide:x-circle" class="mr-1" /> 批量取消授权
        </FaButton>
        <FaButton variant="outline" @click="handleClose">
          <FaIcon name="i-lucide:x" class="mr-1" /> 关闭
        </FaButton>
      </div>
      <RightToolbar v-model:show-search="showSearch" :search="true" @query-table="getList" />
    </div>

    <el-table v-loading="loading" border :data="pagedList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column label="用户昵称" prop="nickName" :show-overflow-tooltip="true" />
      <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" />
      <el-table-column label="手机" prop="phonenumber" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <DictTag :options="sysNormalDisableOptions" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="取消授权" placement="top">
            <el-button v-hasPermi="['system:role:remove']" link type="primary" icon="CircleClose" @click="cancelAuthUser(scope.row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <FaPagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:size="queryParams.pageSize" :total="total" class="mt-4" @page-change="getList" @size-change="getList" />

    <SelectUser ref="selectRef" :role-id="queryParams.roleId" @ok="handleQuery" />
  </FaPageMain>
</template>
