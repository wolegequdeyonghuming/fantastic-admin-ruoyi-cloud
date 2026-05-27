<script setup lang="ts">
import type { NoticeForm, NoticeQuery, NoticeVO } from '@/api/modules/system/notice/types'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import {
  addNotice,
  delNotice,
  getNotice,
  listNotice,
  updateNotice,
} from '@/api/modules/system/notice'
import DictTag from '@/components/RuoYi/DictTag/index.vue'
import RightToolbar from '@/components/RuoYi/RightToolbar/index.vue'
import { useDict } from '@/composables/useDict'

defineOptions({
  name: 'Notice',
})

// Hooks
const { confirm } = useFaModal()
const { success } = useFaToast()
const { getDictOptions, parseTime } = useDict()

// 字典数据
const sysNoticeTypeOptions = getDictOptions('sys_notice_type')
const sysNoticeStatusOptions = getDictOptions('sys_notice_status')

// 状态
const loading = ref(false)
const pagedList = ref<NoticeVO[]>([])
const total = ref(0)
const showSearch = ref(true)
const searchFold = ref(false)
const ids = ref<Array<number | string>>([])
const single = ref(true)
const multiple = ref(true)

// Refs
const queryFormRef = ref<ElFormInstance>()
const noticeFormRef = ref<ElFormInstance>()

// 查询参数
const queryParams = reactive<NoticeQuery>({
  pageNum: 1,
  pageSize: 10,
  noticeTitle: '',
  createByName: '',
  status: '',
  noticeType: '',
})

// 表单数据
const dialog = reactive({
  visible: false,
  title: '',
})

const initFormData: NoticeForm = {
  noticeId: undefined,
  noticeTitle: '',
  noticeType: '',
  noticeContent: '',
  status: '0',
  remark: '',
  createByName: '',
}

const form = reactive<NoticeForm>({ ...initFormData })

const rules = {
  noticeTitle: [
    { required: true, message: '公告标题不能为空', trigger: 'blur' },
  ],
  noticeType: [
    { required: true, message: '公告类型不能为空', trigger: 'change' },
  ],
}

/** 查询公告列表 */
async function getList() {
  loading.value = true
  try {
    const data = await listNotice(queryParams)
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

/** 多选框选中数据 */
function handleSelectionChange(selection: NoticeVO[]) {
  ids.value = selection.map(item => item.noticeId!)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  dialog.title = '添加公告'
  dialog.visible = true
}

/** 修改按钮操作 */
async function handleUpdate(row?: NoticeVO) {
  reset()
  const noticeId = row?.noticeId || ids.value[0]
  const res = await getNotice(noticeId)
  Object.assign(form, res.data)
  dialog.title = '修改公告'
  dialog.visible = true
}

/** 表单重置 */
function reset() {
  Object.assign(form, initFormData)
  noticeFormRef.value?.resetFields()
}

/** 取消按钮 */
function cancel() {
  reset()
  dialog.visible = false
}

/** 提交按钮 */
function submitForm() {
  noticeFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (form.noticeId) {
        await updateNotice(form)
      }
      else {
        await addNotice(form)
      }
      success('操作成功')
      dialog.visible = false
      getList()
    }
  })
}

/** 删除按钮操作 */
async function handleDelete(row?: NoticeVO) {
  const noticeIds = row?.noticeId || ids.value
  try {
    await confirm({
      title: '系统提示',
      content: `是否确认删除公告编号为"${noticeIds}"的数据项？`,
      type: 'warning',
    })
    await delNotice(noticeIds)
    success('删除成功')
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
        <el-form-item label="公告标题" prop="noticeTitle">
          <el-input v-model="queryParams.noticeTitle" placeholder="请输入公告标题" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="操作人员" prop="createByName">
          <el-input v-model="queryParams.createByName" placeholder="请输入操作人员" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="类型" prop="noticeType">
          <el-select v-model="queryParams.noticeType" placeholder="公告类型" clearable>
            <el-option v-for="dict in sysNoticeTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
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
        <FaButton v-hasPermi="['system:notice:add']" @click="handleAdd">
          <FaIcon name="i-lucide:plus" class="mr-1" />
          新增
        </FaButton>
        <FaButton v-hasPermi="['system:notice:edit']" variant="secondary" :disabled="single" @click="handleUpdate()">
          <FaIcon name="i-lucide:edit" class="mr-1" />
          修改
        </FaButton>
        <FaButton v-hasPermi="['system:notice:remove']" variant="destructive" :disabled="multiple" @click="handleDelete()">
          <FaIcon name="i-lucide:trash-2" class="mr-1" />
          删除
        </FaButton>
      </div>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </div>

    <!-- 数据表格 -->
    <el-table v-loading="loading" border :data="pagedList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="公告标题" align="center" prop="noticeTitle" :show-overflow-tooltip="true" />
      <el-table-column label="公告类型" align="center" prop="noticeType" width="100">
        <template #default="scope">
          <DictTag :options="sysNoticeTypeOptions" :value="scope.row.noticeType" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <DictTag :options="sysNoticeStatusOptions" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createByName" width="100" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="100">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button v-hasPermi="['system:notice:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button v-hasPermi="['system:notice:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
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

    <!-- 添加或修改公告对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="780px" append-to-body>
      <el-form ref="noticeFormRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="公告标题" prop="noticeTitle">
              <el-input v-model="form.noticeTitle" placeholder="请输入公告标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公告类型" prop="noticeType">
              <el-select v-model="form.noticeType" placeholder="请选择">
                <el-option v-for="dict in sysNoticeTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sysNoticeStatusOptions" :key="dict.value" :value="dict.value">
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="内容">
              <editor v-model="form.noticeContent" :min-height="192" />
            </el-form-item>
          </el-col>
        </el-row>
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
