<template>
  <div class="lg:hidden">
    <!-- Mobile Menu Button -->
    <button 
      @click="isOpen = !isOpen"
      class="p-2 text-gray-400 hover:text-[#F6B17A] transition-colors"
      aria-label="Toggle menu"
    >
      <svg 
        class="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          v-if="!isOpen"
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M4 6h16M4 12h16M4 18h16"
        />
        <path 
          v-else
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <!-- Mobile Menu -->
    <div 
      v-show="isOpen"
      class="absolute top-16 left-0 right-0 bg-gray-900 border-b border-gray-800 shadow-xl z-50"
    >
      <div class="px-4 py-2 space-y-2">
        <NuxtLink 
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="block py-2 px-4 text-gray-400 hover:text-[#F6B17A] hover:bg-gray-800 rounded-lg transition-colors"
          @click="isOpen = false"
        >
          {{ link.text }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

const links = [
  { to: '/', text: 'Home' },
  { to: '/news_stations', text: 'News' },
  { to: '/gospel_stations', text: 'Gospel' },
  { to: '/malawi_stations', text: 'Malawi' },
  { to: '/top_jazz', text: 'Jazz' },
  { to: '/hip_hop_stations', text: 'Hip Hop' }
]
</script> 