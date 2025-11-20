<template>
  <button :class="['hl-button', `hl-button--${type}`]" @click="handleClick">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  type?: 'primary' | 'success' | 'warning' | 'danger'
}>()

defineOptions({
  name: 'ZyButton',
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (e: MouseEvent) => emit('click', e)
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as *;

.hl-button {
  padding: 8px 16px;
  border-radius: 6px;
  color: #fff;
  background-color: $color-primary;

  &--success { background-color: $color-success; }
  &--warning { background-color: $color-warning; }
  &--danger { background-color: $color-danger; }
}
</style>
