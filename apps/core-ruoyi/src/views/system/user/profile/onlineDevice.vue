<script setup lang="ts">
import { delOnline } from '@/api/modules/monitor/online'
import DictTag from '@/components/RuoYi/DictTag/index.vue'
import { useDict } from '@/composables/useDict'

defineOptions({
  name: 'OnlineDevice',
})

const props = defineProps<{
  devices: OnlineDeviceVO[]
}>()

interface OnlineDeviceVO {
  tokenId: string
  deviceType?: string
  ipaddr?: string
  loginLocation?: string
  os?: string
  browser?: string
  loginTime?: string
}

const { confirm } = useFaModal()
const { success, error } = useFaToast()
const { getDictOptions, parseTime } = useDict()

const sysDeviceTypeOptions = getDictOptions('sys_device_type')

const devices = computed(() => props.devices)

async function handldDelOnline(row: OnlineDeviceVO) {
  try {
    await confirm({
      title: '系统提示',
      content: '删除设备后，在该设备登录需要重新进行验证',
      type: 'warning',
    })
    const res = await delOnline(row.tokenId)
    if (res.code === 200) {
      success('删除成功')
    }
    else {
      error(res.msg)
    }
  }
  catch {
    // 用户取消
  }
}
</script>

<template>
  <div>
    <el-table :data="devices" border style="width: 100%; height: 100%; font-size: 14px;">
      <el-table-column label="设备类型" align="center">
        <template #default="scope">
          <DictTag :options="sysDeviceTypeOptions" :value="scope.row.deviceType" />
        </template>
      </el-table-column>
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
          <el-tooltip content="删除" placement="top">
            <el-button link type="primary" icon="Delete" @click="handldDelOnline(scope.row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
