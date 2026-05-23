<script setup lang="ts">
defineOptions({
  name: 'AdminMonitor',
})

const url = ref(import.meta.env.VITE_APP_MONITOR_ADMIN)
</script>

<template>
  <FaPageMain class="h-full">
    <IFrame :src="url" class="h-full min-h-[600px] w-full" />
  </FaPageMain>
</template>
