<script setup lang="ts">
import { addChildSystem, editChildSystem } from '@/api/modules/system/menu'
import { useDict } from '@/composables/useDict'

defineOptions({
  name: 'SubSystemDialog',
})

const props = withDefaults(defineProps<Props>(), {
  addDialogVisible: false,
  itemData: null,
})
const emit = defineEmits(['close'])
const { success, error } = useFaToast()
const { getDictOptions } = useDict()
const { addDialogVisible } = toRefs(props)

const sysNormalDisableOptions = getDictOptions('sys_normal_disable')

interface Props {
  addDialogVisible?: boolean
  itemData?: any
}

const form = reactive({
  systemName: '',
  systemCode: '',
  systemIcon: '',
  systemSort: 0,
  isFrame: '0',
  systemStatus: '0',
  systemFrame: '',
})

const rules = {
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' },
    { min: 2, max: 100, message: '系统名称长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  systemCode: [
    { required: true, message: '请输入系统编码', trigger: 'blur' },
    { min: 2, max: 100, message: '系统编码长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  systemFrame: [
    { required: true, message: '请输入外链地址', trigger: 'blur' },
    { min: 2, max: 100, message: '外链地址长度在 2 到 100 个字符', trigger: 'blur' },
  ],
}

function cancel() {
  emit('close')
}

const menuFormRef = ref<ElFormInstance>()
const buttonLoading = ref(false)

function submitForm(text: string) {
  menuFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true
      try {
        if (props.itemData) {
          await editChildSystem(form)
          success('操作成功')
          emit('close', text)
        }
        else {
          await addChildSystem(form)
          success('操作成功')
          emit('close', text)
        }
      }
      catch (err) {
        error(err || '操作失败')
      }
      finally {
        buttonLoading.value = false
      }
    }
  })
}

onMounted(() => {
  if (props.itemData) {
    Object.assign(form, props.itemData)
  }
})
</script>

<template>
  <el-dialog v-model="addDialogVisible" :title="props.itemData ? '编辑子系统' : '新增子系统'" destroy-on-close append-to-body width="750px" @close="cancel">
    <el-form ref="menuFormRef" :model="form" :rules="rules" label-width="100px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="系统名称" prop="systemName">
            <el-input v-model="form.systemName" placeholder="请输入系统名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="系统编码" prop="systemCode">
            <el-input v-model="form.systemCode" placeholder="请输入系统编码" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="系统图标" prop="systemIcon">
            <icon-select v-model="form.systemIcon" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              <span>
                <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                  <el-icon><question-filled /></el-icon>
                </el-tooltip>是否外链
              </span>
            </template>
            <el-radio-group v-model="form.isFrame">
              <el-radio value="1">
                是
              </el-radio>
              <el-radio value="0">
                否
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示排序" prop="systemSort">
            <el-input-number v-model="form.systemSort" controls-position="right" :min="0" />
          </el-form-item>
        </el-col>
        <el-col v-if="form.isFrame === '1'" :span="12">
          <el-form-item prop="systemFrame">
            <template #label>
              外链地址
            </template>
            <el-input v-model="form.systemFrame" placeholder="请输入外链地址" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              <span>
                <el-tooltip content="选择停用将不会显示，也不能被访问" placement="top">
                  <el-icon><question-filled /></el-icon>
                </el-tooltip>系统状态
              </span>
            </template>
            <el-radio-group v-model="form.systemStatus">
              <el-radio v-for="dict in sysNormalDisableOptions" :key="dict.value" :value="dict.value">
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button :loading="buttonLoading" type="primary" @click="submitForm('refresh')">
          确 定
        </el-button>
        <el-button @click="cancel">
          取 消
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
