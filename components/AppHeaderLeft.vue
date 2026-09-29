<script setup lang="ts">
const appConfig = useAppConfig()
const site = useSiteConfig()
const { localePath } = useDocusI18n()

const ariaLabel = appConfig.header?.title || site.name || 'weltkugl'
const baseURL = useRuntimeConfig().app.baseURL
const lightLogo = `${baseURL}wiki-logo-light.png`
const darkLogo = `${baseURL}wiki-logo-dark.png`
</script>

<template>
  <NuxtLink
    :to="localePath('/')"
    :aria-label="ariaLabel"
    class="inline-flex items-center"
  >
    <img
      :src="lightLogo"
      alt="weltkugl wiki logo"
      class="h-6 w-auto shrink-0 dark:hidden"
    >
    <img
      :src="darkLogo"
      alt=""
      class="hidden h-6 w-auto shrink-0 dark:block"
    >
  </NuxtLink>
</template>
