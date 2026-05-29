<script setup lang="ts">
import { propTypes } from '@/utils/propTypes'

const props = defineProps({
  iconClass: propTypes.string.isRequired,
  className: propTypes.string.def(''),
  color: propTypes.string.def(''),
})
const iconName = computed(() => `#icon-${props.iconClass}`)
const svgClass = computed(() => {
  if (props.className) {
    return `svg-icon ${props.className}`
  }
  return 'svg-icon'
})
</script>

<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName" :fill="color" />
  </svg>
</template>

<style lang="scss" scoped>
.sub-el-icon,
.nav-icon {
  position: relative;
  display: inline-block;
  margin-right: 12px;
  font-size: 15px;
}

.svg-icon {
  position: relative;
  width: 1em;
  height: 1em;
  vertical-align: -2px;
  fill: currentcolor;
}
</style>
