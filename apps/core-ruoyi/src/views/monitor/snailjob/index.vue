<template>
  <FaPageMain class="h-full">
    <IFrame :src="url" class="w-full h-full min-h-[600px]" />
  </FaPageMain>
</template>

<script setup lang="ts">
defineOptions({
  name: 'SnailJob',
})

const url = ref(import.meta.env.VITE_APP_SNAILJOB_ADMIN)
</script>
