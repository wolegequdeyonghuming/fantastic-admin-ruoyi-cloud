<script setup lang="ts">
import { deleteChildSystem, getChildSystemList } from '@/api/modules/system/menu'
import DictTag from '@/components/RuoYi/DictTag/index.vue'
import RightToolbar from '@/components/RuoYi/RightToolbar/index.vue'
import { useDict } from '@/composables/useDict'
import SubSystemDialog from './dialog/add.vue'

defineOptions({
  name: 'SubSystem',
})

const { confirm } = useFaModal()
const { success } = useFaToast()
const { getDictOptions } = useDict()

const sysNormalDisableOptions = getDictOptions('sys_normal_disable')

const router = useRouter()

const addDialogVisible = ref(false)
const pagedList = ref<any[]>([])
const showSearch = ref(true)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
})
const total = ref(0)
const loading = ref(false)

async function getList() {
  loading.value = true
  try {
    const res = await getChildSystemList(queryParams)
    pagedList.value = res.rows
    total.value = res.total
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  getList()
})

function handleAddMenu(row: any) {
  router.push({ path: '/system/menu', query: { systemCode: row.systemCode } })
}

const itemData = ref<any>({})
function handleAdd() {
  itemData.value = null
  addDialogVisible.value = true
}

function handleUpdate(row: any) {
  itemData.value = Object.assign({}, row)
  addDialogVisible.value = true
}

async function handleDelete(row?: any) {
  try {
    await confirm({
      title: '系统提示',
      content: '是否确认删除该数据项?',
      type: 'warning',
    })
    await deleteChildSystem(row?.id)
    success('删除成功')
    getList()
  }
  catch {
    // 用户取消
  }
}

function handleClose(text: string) {
  addDialogVisible.value = false
  if (text === 'refresh') {
    getList()
  }
}
</script>

<template>
  <FaPageMain>
    <div class="my-4 flex items-center justify-between">
      <div class="flex gap-2">
        <FaButton v-hasPermi="['system:dept:add']" @click="handleAdd()">
          <FaIcon name="i-lucide:plus" class="mr-1" /> 新增
        </FaButton>
      </div>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </div>

    <el-table v-loading="loading" :data="pagedList" row-key="menuId" border>
      <el-table-column prop="systemName" label="系统名称" :show-overflow-tooltip="true" align="center" />
      <el-table-column prop="systemIcon" label="图标" align="center">
        <template #default="scope">
          <svg-icon :icon-class="scope.row.systemIcon" />
        </template>
      </el-table-column>
      <el-table-column prop="systemSort" label="排序" align="center" />
      <el-table-column prop="systemCode" label="系统编码" align="center" />
      <el-table-column prop="perms" label="是否外链" align="center">
        <template #default="scope">
          {{ scope.row.isFrame === '1' ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column prop="component" label="外链地址" :show-overflow-tooltip="true" align="center" />
      <el-table-column prop="status" label="系统状态" align="center">
        <template #default="scope">
          <DictTag :options="sysNormalDisableOptions" :value="scope.row.systemStatus" />
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="220" align="center">
        <template #default="scope">
          <el-tooltip content="添加菜单" placement="top">
            <el-button v-hasPermi="['system:menu:add']" link type="primary" icon="Plus" @click="handleAddMenu(scope.row)" />
          </el-tooltip>
          <el-tooltip content="修改" placement="top">
            <el-button v-hasPermi="['system:menu:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button v-hasPermi="['system:menu:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
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

    <SubSystemDialog
      v-if="addDialogVisible"
      :add-dialog-visible="addDialogVisible"
      :item-data="itemData"
      @close="handleClose"
    />
  </FaPageMain>
</template>
