<template>
  <div class="min-h-screen bg-gray-900">
    <TheNavigation />
    <slot />
    <AudioPlayer />
  </div>
</template>

<script setup lang="ts">
import { createAudioState } from '~/composables/useAudioState'

// Initialize audio state
createAudioState()
</script> 