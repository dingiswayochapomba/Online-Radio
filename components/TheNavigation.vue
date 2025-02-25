<template>
  <nav class="bg-gray-800 shadow-lg border-b border-gray-700 p-4 sticky top-0 z-50">
    <div class="container mx-auto">
      <!-- Desktop Navigation -->
      <div class="hidden md:flex justify-between items-center">
        <NuxtLink to="/" class="flex items-center gap-3">
          <div class="w-10 h-10 bg-[#F6B17A] rounded-lg flex items-center justify-center">
            <span class="text-xl">🎵</span>
          </div>
          <h1 class="text-2xl font-bold bg-gradient-to-r from-[#F6B17A] to-orange-500 text-transparent bg-clip-text">
            TuneRadio
          </h1>
        </NuxtLink>
        <div class="flex items-center gap-6">
          <NuxtLink 
            v-for="link in navigationLinks" 
            :key="link.path"
            :to="link.path"
            class="text-gray-400 hover:text-[#F6B17A] transition-colors"
            :class="{ 'text-[#F6B17A]': route.path === link.path }"
          >
            {{ link.name }}
          </NuxtLink>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div class="md:hidden">
        <div class="flex justify-between items-center">
          <NuxtLink to="/" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-[#F6B17A] rounded-lg flex items-center justify-center">
              <span class="text-base">🎵</span>
            </div>
            <h1 class="text-xl font-bold bg-gradient-to-r from-[#F6B17A] to-orange-500 text-transparent bg-clip-text">
              TuneRadio
            </h1>
          </NuxtLink>
          <button 
            @click="isMenuOpen = !isMenuOpen"
            class="text-gray-400 hover:text-[#F6B17A] transition-colors"
          >
            {{ isMenuOpen ? '✕' : '☰' }}
          </button>
        </div>

        <!-- Mobile Menu -->
        <div 
          v-if="isMenuOpen"
          class="absolute left-0 right-0 top-[72px] bg-gray-800 border-b border-gray-700 shadow-lg"
        >
          <div class="container mx-auto py-4">
            <NuxtLink 
              v-for="link in navigationLinks" 
              :key="link.path"
              :to="link.path"
              class="block py-3 px-4 text-gray-400 hover:text-[#F6B17A] transition-colors"
              :class="{ 'text-[#F6B17A] bg-gray-700/50': route.path === link.path }"
              @click="isMenuOpen = false"
            >
              {{ link.name }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isMenuOpen = ref(false)

const navigationLinks = [
  { name: 'Home', path: '/' },
  { name: 'News', path: '/news_stations' },
  { name: 'Gospel', path: '/gospel_stations' },
  { name: 'Jazz', path: '/top_jazz' },
  { name: 'Malawi', path: '/malawi_stations' }
]
</script> 