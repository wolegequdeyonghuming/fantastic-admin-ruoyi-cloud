<script setup lang="ts">
import type { UserQuery, UserVO } from '@/api/modules/system/user/types'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import { authUserSelectAll, unallocatedUserList } from '@/api/modules/system/role'
import DictTag from '@/components/RuoYi/DictTag/index.vue'
import { useDict } from '@/composables/useDict'

defineOptions({
  name: 'SelectUser',
})

const props = defineProps({
  roleId: {
    type: [Number, String],
    required: true,
  },
})
const emit = defineEmits(['ok'])
const { success, error } = useFaToast()
const { getDictOptions, parseTime } = useDict()

const sysNormalDisableOptions = getDictOptions('sys_normal_disable')

const pagedList = ref<UserVO[]>([])
const visible = ref(false)
const total = ref(0)
const searchFold = ref(false)
const userIds = ref<Array<string | number>>([])

const queryParams = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 10,
  roleId: undefined,
  userName: undefined,
  phonenumber: undefined,
})

const tableRef = ref<ElTableInstance>()
const queryFormRef = ref<ElFormInstance>()

function show() {
  queryParams.roleId = props.roleId
  getList()
  visible.value = true
}

function clickRow(row: any) {
  tableRef.value?.toggleRowSelection(row, false)
}

function handleSelectionChange(selection: UserVO[]) {
  userIds.value = selection.map((item: UserVO) => item.userId)
}

async function getList() {
  const res = await unallocatedUserList(queryParams)
  pagedList.value = res.rows
  total.value = res.total
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryFormRef.value?.resetFields()
  getList()
}

async function handleSelectUser() {
  const roleId = queryParams.roleId
  const ids = userIds.value.join(',')
  if (ids === '') {
    error('请选择要分配的用户')
    return
  }
  await authUserSelectAll({ roleId, userIds: ids })
  success('分配成功')
  emit('ok')
  visible.value = false
}

defineExpose({
  show,
})
</script>

<template>
  <el-row>
    <el-dialog v-model="visible" title="选择用户" width="800px" top="5vh" append-to-body>
      <FaSearchBar v-model:fold="searchFold" :show-toggle="true">
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
      <el-row>
        <el-table ref="tableRef" border :data="pagedList" height="260px" @row-click="clickRow" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
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
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
        </el-table>
        <FaPagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:size="queryParams.pageSize" :total="total" class="mt-4" @page-change="getList" @size-change="getList" />
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <FaButton @click="handleSelectUser">
            确 定
          </FaButton>
          <FaButton variant="outline" @click="visible = false">
            取 消
          </FaButton>
        </div>
      </template>
    </el-dialog>
  </el-row>
</template>
