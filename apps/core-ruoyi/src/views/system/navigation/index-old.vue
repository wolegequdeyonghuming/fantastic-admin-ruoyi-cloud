<script setup name="PortalNavigation" lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref } from 'vue'

// 遮罩层
const loading = ref(true)
// 显示搜索条件
const showSearch = ref(true)
// 搜索栏折叠
const searchFold = ref(false)
// 总条数
const total = ref(0)
// 导航列表
const navigationList = ref([])
// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  navName: undefined,
})

/** 查询导航列表 */
function getList() {
  loading.value = true
  // TODO: 调用接口获取数据
  // 这里先用模拟数据
  setTimeout(() => {
    navigationList.value = [
      { id: 1, navName: '数据中心', navKey: 'datacenter', navIcon: 'i-ep-coin', navUrl: null, isFrame: '0', navSort: 1, status: '0', createTime: '2026-01-15 10:00:00' },
      { id: 2, navName: '业务系统', navKey: 'business', navIcon: 'i-ep-files', navUrl: null, isFrame: '0', navSort: 2, status: '0', createTime: '2026-01-15 10:00:00' },
      { id: 3, navName: '综合分析', navKey: 'analysis', navIcon: 'i-ep-data-analysis', navUrl: null, isFrame: '0', navSort: 3, status: '0', createTime: '2026-01-15 10:00:00' },
      { id: 4, navName: '管理平台', navKey: 'management', navIcon: 'i-ep-setting', navUrl: 'http://localhost:8080', isFrame: '1', navSort: 4, status: '0', createTime: '2026-01-15 10:00:00' },
      { id: 5, navName: '帮助中心', navKey: 'help', navIcon: 'i-ep-question-filled', navUrl: null, isFrame: '0', navSort: 5, status: '0', createTime: '2026-01-15 10:00:00' },
    ] as any
    total.value = 5
    loading.value = false
  }, 500)
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    navName: undefined,
  }
  handleQuery()
}

/** 新增按钮操作 */
function handleAdd() {
  ElMessage.info('新增功能待实现')
}

/** 修改按钮操作 */
function handleUpdate(row: { id?: number | string, navName?: string }) {
  ElMessage.info(`编辑功能待实现：${row.navName}`)
}

/** 删除按钮操作 */
function handleDelete(row: { id?: number | string, navName?: string }) {
  ElMessageBox.confirm(`是否确认删除导航"${row.navName}"?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

/** 菜单管理 */
function handleMenu(row: { id?: number | string, navName?: string }) {
  ElMessage.info(`菜单管理功能待实现：${row.navName}`)
}

// 初始化
getList()
</script>

<template>
  <FaPageMain>
    <FaSearchBar v-model:fold="searchFold" :show-toggle="true" class="mb-4">
      <el-form :model="queryParams" :inline="true">
        <el-form-item label="导航名称" prop="navName">
          <el-input
            v-model="queryParams.navName"
            placeholder="请输入导航名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">
            搜索
          </el-button>
          <el-button icon="Refresh" @click="resetQuery">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </FaSearchBar>

    <div class="my-4 flex items-center justify-between">
      <div class="flex gap-2">
        <FaButton @click="handleAdd">
          <FaIcon name="i-lucide:plus" class="mr-1" />新增
        </FaButton>
      </div>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </div>

    <el-table v-loading="loading" :data="navigationList" border>
      <el-table-column label="导航ID" align="center" prop="id" width="80" />
      <el-table-column label="导航名称" align="center" prop="navName" />
      <el-table-column label="导航标识" align="center" prop="navKey" />
      <el-table-column label="导航图标" align="center" prop="navIcon" width="100">
        <template #default="scope">
          <i :class="scope.row.navIcon" style="font-size: 20px;" />
        </template>
      </el-table-column>
      <el-table-column label="跳转地址" align="center" prop="navUrl" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.navUrl">{{ scope.row.navUrl }}</span>
          <span v-else style="color: #909399;">未配置</span>
        </template>
      </el-table-column>
      <el-table-column label="是否外链" align="center" prop="isFrame" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.isFrame === '1' ? 'warning' : 'info'" size="small">
            {{ scope.row.isFrame === '1' ? '外链' : '内部' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="显示顺序" align="center" prop="navSort" width="100" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">
            {{ scope.row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="编辑" placement="top">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" />
          </el-tooltip>
          <el-tooltip content="菜单管理" placement="top">
            <el-button link type="success" icon="Menu" @click="handleMenu(scope.row)">
              菜单
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

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
