<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({
  title: 'VybeStream-Radio',
  meta: [
    { name: 'description', content: 'Listen to your favorite radio stations from around the world' }
  ]
})
</script>
