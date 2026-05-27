<script setup lang="ts">
import { Menu } from '@element-plus/icons-vue'
import { propTypes } from '@/utils/propTypes'

const props = defineProps({
  columns: propTypes.fieldOption,
  gutter: propTypes.number.def(10),
})

const columnRef = ref<ElTreeInstance>()
const style = computed(() => {
  const ret: any = {}
  if (props.gutter) {
    ret.marginRight = `${props.gutter / 2}px`
  }
  return ret
})

// 更改数据列的显示和隐藏
function columnChange(...args: any[]) {
  props.columns?.forEach((item) => {
    item.visible = args[1].checkedKeys.includes(item.key)
  })
}

// 显隐列初始默认隐藏列
onMounted(() => {
  props.columns?.forEach((item) => {
    if (item.visible) {
      columnRef.value?.setChecked(item.key, true, false)
      // value.value.push(item.key);
    }
  })
})
</script>

<template>
  <div class="top-right-btn" :style="style">
    <el-row>
      <el-tooltip v-if="columns" class="item" effect="dark" content="显示/隐藏列" placement="top">
        <div class="show-btn">
          <el-popover placement="bottom" trigger="click">
            <div class="tree-header">
              显示/隐藏列
            </div>
            <el-tree
              ref="columnRef"
              :data="columns"
              show-checkbox
              node-key="key"
              :props="{ label: 'label', children: 'children' } as any"
              @check="columnChange"
            />
            <template #reference>
              <el-button circle :icon="Menu" />
            </template>
          </el-popover>
        </div>
      </el-tooltip>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-transfer__button) {
  display: block;
  margin-left: 0;
  border-radius: 50%;
}

:deep(.el-transfer__button:first-child) {
  margin-bottom: 10px;
}

.my-el-transfer {
  text-align: center;
}

.tree-header {
  width: 100%;
  line-height: 24px;
  text-align: center;
}

.show-btn {
  margin-left: 12px;
}
</style>
