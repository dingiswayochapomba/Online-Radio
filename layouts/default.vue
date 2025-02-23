<template>
  <div :class="theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'" class="min-h-screen">
    <nav :class="theme === 'dark' ? 'bg-gray-800' : 'bg-white'" class="shadow-lg">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex justify-between">
          <div class="flex space-x-7">
            <div class="flex items-center py-4">
              <NuxtLink to="/" class="flex items-center space-x-2 text-xl font-bold" :class="theme === 'dark' ? 'text-white' : 'text-gray-900'">
                <RadioIcon class="h-8 w-8" />
                <span>TuneRadio</span>
              </NuxtLink>
            </div>
            <div class="flex items-center space-x-4">
              <NuxtLink to="/" class="py-4 px-2" :class="theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'">
                Home
              </NuxtLink>
              <NuxtLink to="/malawi_stations" class="py-4 px-2 text-gray-300 hover:text-white">Malawi Stations</NuxtLink>
              <NuxtLink to="/top_jazz" class="py-4 px-2 text-gray-300 hover:text-white">Jazz Stations</NuxtLink>
              <NuxtLink to="/news_stations" class="py-4 px-2 text-gray-300 hover:text-white">News Stations</NuxtLink>
              <NuxtLink 
                to="/gospel_stations" 
                class="py-4 px-2 text-gray-300 hover:text-white"
                :class="{ 'text-white': $route.path === '/gospel_stations' }"
              >
                Gospel Stations
              </NuxtLink>
              <NuxtLink to="/about" class="py-4 px-2 text-gray-300 hover:text-white">About</NuxtLink>
             
            </div>
          </div>
          <div class="flex items-center">
            <button @click="toggleTheme" class="p-2 rounded-lg" :class="theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'">
              {{ theme === 'dark' ? '🌙' : '☀️' }}
            </button>
          </div>
        </div>
      </div>
    </nav>
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RadioIcon } from '@heroicons/vue/24/solid'
import { useRoute } from '#app'
import { useTheme } from '~/composables/useTheme'

const route = useRoute()
const { theme, toggleTheme } = useTheme()
</script> 