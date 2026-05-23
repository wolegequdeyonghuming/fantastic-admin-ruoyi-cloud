<template>
  <FaModal v-model:open="open" title="操作日志详细" width="700px" @closed="info = null">
    <el-descriptions v-if="info" :column="1" border>
      <el-descriptions-item label="操作状态">
        <template #default>
          <DictTag :options="sysOperTypeOptions" :value="info.status" />
        </template>
      </el-descriptions-item>
      <el-descriptions-item label="登录信息">
        <template #default> {{ info.operName }} / {{ info.deptName }} / {{ info.operIp }} / {{ info.operLocation }} </template>
      </el-descriptions-item>
      <el-descriptions-item label="请求信息">
        <template #default> {{ info.requestMethod }} {{ info.operUrl }} </template>
      </el-descriptions-item>
      <el-descriptions-item label="操作模块">
        <template #default> {{ info.title }} / {{ typeFormat(info) }} </template>
      </el-descriptions-item>
      <el-descriptions-item label="操作方法">
        <template #default>
          {{ info.method }}
        </template>
      </el-descriptions-item>
      <el-descriptions-item label="请求参数">
        <template #default>
          <div class="max-h-300px overflow-y-auto">
            <VueJsonPretty :data="formatToJsonObject(info.operParam)" />
          </div>
        </template>
      </el-descriptions-item>
      <el-descriptions-item label="返回参数">
        <template #default>
          <div class="max-h-300px overflow-y-auto">
            <VueJsonPretty :data="formatToJsonObject(info.jsonResult)" />
          </div>
        </template>
      </el-descriptions-item>
      <el-descriptions-item label="消耗时间">
        <template #default>
          <span> {{ info.costTime }}ms </span>
        </template>
      </el-descriptions-item>
      <el-descriptions-item label="操作时间">
        <template #default> {{ parseTime(info.operTime) }}</template>
      </el-descriptions-item>
      <el-descriptions-item v-if="info.status === 1" label="异常信息">
        <template #default>
          <span class="text-red-500"> {{ info.errorMsg }}</span>
        </template>
      </el-descriptions-item>
    </el-descriptions>
  </FaModal>
</template>

<script setup lang="ts">
import type { OperLogForm } from '@/api/modules/monitor/operlog/types'
import DictTag from '@/components/RuoYi/DictTag/index.vue'
import { useDict } from '@/composables/useDict'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

const open = ref(false)
const info = ref<OperLogForm | null>(null)

// Hooks
const { getDictOptions, getDictLabel, parseTime } = useDict()

// 字典数据
const sysOperTypeOptions = getDictOptions('sys_oper_type')

function openDialog(row: OperLogForm) {
  info.value = row
  open.value = true
}

function closeDialog() {
  open.value = false
}

/**
 * json转为对象
 * @param data 原始数据
 */
function formatToJsonObject(data: string) {
  try {
    return JSON.parse(data)
  }
  catch (error) {
    return data
  }
}

/**
 * 字典信息
 */
const typeFormat = (row: OperLogForm) => {
  return getDictLabel('sys_oper_type', row.businessType!)
}

defineExpose({
  openDialog,
  closeDialog,
})
</script>

<style lang="scss" scoped>
:deep(.el-descriptions__label) {
  min-width: 100px;
}
:deep(.el-descriptions__content) {
  max-width: 300px;
}
</style>
