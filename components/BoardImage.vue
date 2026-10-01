<script setup lang="ts">
const props = withDefaults(defineProps<{
  src: string
  alt: string
  height?: string
}>(), {
  height: '18rem',
})

const baseURL = useRuntimeConfig().app.baseURL

const imageUrl = computed(() => {
  const base = baseURL.endsWith('/') ? baseURL : `${baseURL}/`
  return `${base}${props.src.replace(/^\//, '')}`
})
</script>

<template>
  <div
    role="img"
    :aria-label="alt"
    :style="{
      height,
      width: '100%',
      marginBottom: '1.5rem',
      borderRadius: '0.75rem',
      backgroundColor: '#fff',
      backgroundImage: `url('${imageUrl}')`,
      backgroundPosition: 'center',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
    }"
  />
</template>
