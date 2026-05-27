<script setup lang="ts">
import type { DeptTreeVO, DeptVO } from '@/api/modules/system/dept/types'
import type { PostForm, PostQuery, PostVO } from '@/api/modules/system/post/types'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import { addPost, delPost, deptTreeSelect, getPost, listPost, updatePost } from '@/api/modules/system/post'
import DictTag from '@/components/RuoYi/DictTag/index.vue'
import RightToolbar from '@/components/RuoYi/RightToolbar/index.vue'
import { useDict } from '@/composables/useDict'
import { download } from '@/utils/download'

defineOptions({
  name: 'Post',
})

const { confirm } = useFaModal()
const { success } = useFaToast()
const { getDictOptions, parseTime } = useDict()

const sysNormalDisableOptions = getDictOptions('sys_normal_disable')

const pagedList = ref<PostVO[]>([])
const loading = ref(true)
const showSearch = ref(true)
const searchFold = ref(false)
const ids = ref<Array<number | string>>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const deptName = ref('')
const deptOptions = ref<DeptTreeVO[]>([])
const deptTreeRef = ref<ElTreeInstance>()

const queryFormRef = ref<ElFormInstance>()
const postFormRef = ref<ElFormInstance>()

const dialog = reactive({
  visible: false,
  title: '',
})

const initFormData: PostForm = {
  postId: undefined,
  deptId: undefined,
  postCode: '',
  postName: '',
  postCategory: '',
  postSort: 0,
  status: '0',
  remark: '',
}

const form = reactive<PostForm>({ ...initFormData })

const queryParams = reactive<PostQuery>({
  pageNum: 1,
  pageSize: 10,
  deptId: undefined,
  belongDeptId: undefined,
  postCode: '',
  postName: '',
  postCategory: '',
  status: '',
})

const rules = {
  postName: [{ required: true, message: '岗位名称不能为空', trigger: 'blur' }],
  postCode: [{ required: true, message: '岗位编码不能为空', trigger: 'blur' }],
  deptId: [{ required: true, message: '部门不能为空', trigger: 'blur' }],
  postSort: [{ required: true, message: '岗位顺序不能为空', trigger: 'blur' }],
}

function filterNode(value: string, data: any) {
  if (!value) {
    return true
  }
  return data.label.includes(value)
}

watchEffect(() => {
  deptTreeRef.value?.filter(deptName.value)
}, { flush: 'post' })

async function getTreeSelect() {
  const res = await deptTreeSelect()
  deptOptions.value = res.data
}

function handleNodeClick(data: DeptVO) {
  queryParams.belongDeptId = data.id
  queryParams.deptId = undefined
  handleQuery()
}

async function getList() {
  loading.value = true
  try {
    const res = await listPost(queryParams)
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
  postFormRef.value?.resetFields()
}

function handleQuery() {
  queryParams.pageNum = 1
  if (queryParams.deptId) {
    queryParams.belongDeptId = undefined
  }
  getList()
}

function resetQuery() {
  queryFormRef.value?.resetFields()
  queryParams.pageNum = 1
  queryParams.deptId = undefined
  deptTreeRef.value?.setCurrentKey(undefined)
  queryParams.belongDeptId = undefined
  handleQuery()
}

function handleSelectionChange(selection: PostVO[]) {
  ids.value = selection.map(item => item.postId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  dialog.visible = true
  dialog.title = '添加岗位'
}

async function handleUpdate(row?: PostVO) {
  reset()
  const postId = row?.postId || ids.value[0]
  const res = await getPost(postId)
  Object.assign(form, res.data)
  dialog.visible = true
  dialog.title = '修改岗位'
}

function submitForm() {
  postFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (form.postId) {
        await updatePost(form)
      }
      else {
        await addPost(form)
      }
      success('操作成功')
      dialog.visible = false
      getList()
    }
  })
}

async function handleDelete(row?: PostVO) {
  const postIds = row?.postId || ids.value
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认删除岗位编号为"${postIds}"的数据项？`,
      type: 'warning',
    })
    await delPost(postIds)
    success('删除成功')
    getList()
  }
  catch {
    // 用户取消
  }
}

function handleExport() {
  download('/system/post/export', { ...queryParams }, `post_${Date.now()}.xlsx`)
}

onMounted(() => {
  getTreeSelect()
  getList()
})
</script>

<template>
  <FaPageMain>
    <el-row :gutter="20">
      <el-col :lg="4" :xs="24">
        <el-card shadow="hover">
          <el-input v-model="deptName" placeholder="请输入部门名称" prefix-icon="Search" clearable />
          <el-tree
            ref="deptTreeRef"
            class="mt-2"
            node-key="id"
            :data="deptOptions"
            :props="{ label: 'label', children: 'children' } as any"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          />
        </el-card>
      </el-col>
      <el-col :lg="20" :xs="24">
        <FaSearchBar v-model:fold="searchFold" :show-toggle="true" class="mb-4">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="岗位编码" prop="postCode">
              <el-input v-model="queryParams.postCode" placeholder="请输入岗位编码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="类别编码" prop="postCategory">
              <el-input v-model="queryParams.postCategory" placeholder="请输入类别编码" clearable style="width: 200px;" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="岗位名称" prop="postName">
              <el-input v-model="queryParams.postName" placeholder="请输入岗位名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="部门" prop="deptId">
              <el-tree-select
                v-model="queryParams.deptId"
                :data="deptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' } as any"
                value-key="id"
                placeholder="请选择部门"
                check-strictly
              />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="岗位状态" clearable>
                <el-option v-for="dict in sysNormalDisableOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
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
            <FaButton v-hasPermi="['system:post:add']" @click="handleAdd">
              <FaIcon name="i-lucide:plus" class="mr-1" /> 新增
            </FaButton>
            <FaButton v-hasPermi="['system:post:edit']" variant="secondary" :disabled="single" @click="handleUpdate()">
              <FaIcon name="i-lucide:edit" class="mr-1" /> 修改
            </FaButton>
            <FaButton v-hasPermi="['system:post:remove']" variant="destructive" :disabled="multiple" @click="handleDelete()">
              <FaIcon name="i-lucide:trash-2" class="mr-1" /> 删除
            </FaButton>
            <FaButton v-hasPermi="['system:post:export']" variant="outline" @click="handleExport">
              <FaIcon name="i-lucide:download" class="mr-1" /> 导出
            </FaButton>
          </div>
          <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
        </div>

        <el-table v-loading="loading" border :data="pagedList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column v-if="false" label="岗位编号" align="center" prop="postId" />
          <el-table-column label="岗位编码" align="center" prop="postCode" />
          <el-table-column label="类别编码" align="center" prop="postCategory" />
          <el-table-column label="岗位名称" align="center" prop="postName" />
          <el-table-column label="部门" align="center" prop="deptName" />
          <el-table-column label="排序" align="center" prop="postSort" />
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
          <el-table-column label="操作" width="180" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-tooltip content="修改" placement="top">
                <el-button v-hasPermi="['system:post:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button v-hasPermi="['system:post:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <FaPagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:size="queryParams.pageSize" :total="total" class="mt-4" @page-change="getList" @size-change="getList" />
      </el-col>
    </el-row>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="postFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="岗位名称" prop="postName">
          <el-input v-model="form.postName" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-tree-select
            v-model="form.deptId"
            :data="deptOptions"
            :props="{ value: 'id', label: 'label', children: 'children' } as any"
            value-key="id"
            placeholder="请选择部门"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="岗位编码" prop="postCode">
          <el-input v-model="form.postCode" placeholder="请输入编码名称" />
        </el-form-item>
        <el-form-item label="类别编码" prop="postCategory">
          <el-input v-model="form.postCategory" placeholder="请输入类别编码" />
        </el-form-item>
        <el-form-item label="岗位顺序" prop="postSort">
          <el-input-number v-model="form.postSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="岗位状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sysNormalDisableOptions" :key="dict.value" :value="dict.value">
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
