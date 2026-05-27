<script setup lang="ts">
import type { CacheVO } from '@/api/modules/monitor/cache/types'
import * as echarts from 'echarts'
import { getCache } from '@/api/modules/monitor/cache'

defineOptions({
  name: 'Cache',
})

const cache = ref<Partial<CacheVO>>({})
const commandChartRef = ref<HTMLElement>()
const memoryChartRef = ref<HTMLElement>()
const loading = ref(false)

async function getList() {
  loading.value = true
  try {
    const { data } = await getCache()
    cache.value = data
    initCharts(data)
  }
  finally {
    loading.value = false
  }
}

function initCharts(data: CacheVO) {
  if (!commandChartRef.value || !memoryChartRef.value) {
    return
  }

  // 命令统计图表
  const commandChart = echarts.init(commandChartRef.value)
  commandChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
    },
    series: [
      {
        name: '命令',
        type: 'pie',
        roseType: 'radius',
        radius: [15, 95],
        center: ['50%', '38%'],
        data: data.commandStats,
        animationEasing: 'cubicInOut',
        animationDuration: 1000,
      },
    ],
  })

  // 内存信息图表
  const memoryChart = echarts.init(memoryChartRef.value)
  memoryChart.setOption({
    tooltip: {
      formatter: `{b} <br/>{a} : ${data.info.used_memory_human}`,
    },
    series: [
      {
        name: '峰值',
        type: 'gauge',
        min: 0,
        max: 1000,
        detail: {
          formatter: data.info.used_memory_human,
        },
        data: [
          {
            value: Number.parseFloat(data.info.used_memory_human),
            name: '内存消耗',
          },
        ],
      },
    ],
  })

  window.addEventListener('resize', () => {
    commandChart.resize()
    memoryChart.resize()
  })
}

onMounted(() => {
  getList()
})
</script>

<template>
  <FaPageMain>
    <!-- 基本信息 -->
    <FaCard title="基本信息" class="mb-4">
      <div class="gap-4 grid grid-cols-4">
        <div class="info-item">
          <span class="text-gray-500">Redis版本</span>
          <span class="font-medium ml-2">{{ cache.info?.redis_version }}</span>
        </div>
        <div class="info-item">
          <span class="text-gray-500">运行模式</span>
          <span class="font-medium ml-2">{{ cache.info?.redis_mode === 'standalone' ? '单机' : '集群' }}</span>
        </div>
        <div class="info-item">
          <span class="text-gray-500">端口</span>
          <span class="font-medium ml-2">{{ cache.info?.tcp_port }}</span>
        </div>
        <div class="info-item">
          <span class="text-gray-500">客户端数</span>
          <span class="font-medium ml-2">{{ cache.info?.connected_clients }}</span>
        </div>
        <div class="info-item">
          <span class="text-gray-500">运行时间(天)</span>
          <span class="font-medium ml-2">{{ cache.info?.uptime_in_days }}</span>
        </div>
        <div class="info-item">
          <span class="text-gray-500">使用内存</span>
          <span class="font-medium ml-2">{{ cache.info?.used_memory_human }}</span>
        </div>
        <div class="info-item">
          <span class="text-gray-500">使用CPU</span>
          <span class="font-medium ml-2">{{ parseFloat(cache.info?.used_cpu_user_children || '0').toFixed(2) }}</span>
        </div>
        <div class="info-item">
          <span class="text-gray-500">内存配置</span>
          <span class="font-medium ml-2">{{ cache.info?.maxmemory_human }}</span>
        </div>
        <div class="info-item">
          <span class="text-gray-500">AOF是否开启</span>
          <span class="font-medium ml-2">{{ cache.info?.aof_enabled === '0' ? '否' : '是' }}</span>
        </div>
        <div class="info-item">
          <span class="text-gray-500">RDB是否成功</span>
          <span class="font-medium ml-2">{{ cache.info?.rdb_last_bgsave_status }}</span>
        </div>
        <div class="info-item">
          <span class="text-gray-500">Key数量</span>
          <span class="font-medium ml-2">{{ cache.dbSize }}</span>
        </div>
        <div class="info-item">
          <span class="text-gray-500">网络入口/出口</span>
          <span class="font-medium ml-2">{{ cache.info?.instantaneous_input_kbps }}kps/{{ cache.info?.instantaneous_output_kbps }}kps</span>
        </div>
      </div>
    </FaCard>

    <!-- 图表 -->
    <div class="gap-4 grid grid-cols-2">
      <FaCard title="命令统计">
        <div ref="commandChartRef" class="h-80" />
      </FaCard>
      <FaCard title="内存信息">
        <div ref="memoryChartRef" class="h-80" />
      </FaCard>
    </div>
  </FaPageMain>
</template>
