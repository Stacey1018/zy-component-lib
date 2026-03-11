<template>
  <button :class="['zy-button', `zy-button--${type}`]" @click="handleClick">
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

