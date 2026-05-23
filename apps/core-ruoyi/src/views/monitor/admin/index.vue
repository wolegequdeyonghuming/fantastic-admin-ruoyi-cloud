<script setup lang="ts">
defineOptions({
  name: 'AdminMonitor',
})

const url = ref(import.meta.env.VITE_APP_MONITOR_ADMIN)
</script>

<template>
  <FaPageMain title="Admin 控制台" class="h-full">
    <IFrame :src="url" class="h-full min-h-[600px] w-full" />
  </FaPageMain>
</template>
