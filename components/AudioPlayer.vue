<template>
  <div class="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-lg z-50">
    <div class="container mx-auto p-4">
      <div class="flex items-center gap-4">
        <!-- Track Info -->
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <div class="w-16 h-16 relative group">
            <img 
              :src="state.currentTrack.artwork"
              :alt="state.currentTrack.title"
              class="w-full h-full object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
              @error="handleImageError"
            >
            <div class="absolute -top-2 -right-2 bg-[#F6B17A] px-2 py-0.5 rounded-full text-gray-900 text-xs font-semibold">
              {{ state.isPlaying ? 'Live' : 'Ready' }}
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-white font-semibold truncate">{{ state.currentTrack.title }}</h3>
            <p class="text-gray-400 text-sm truncate">{{ state.currentTrack.artist }}</p>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-4">
          <button 
            @click="actions.handlePlayPause" 
            class="w-10 h-10 rounded-full bg-[#F6B17A] flex items-center justify-center hover:bg-[#e5a06b] transition-colors text-gray-900"
            :disabled="!state.currentTrack.streamUrl"
            :class="{ 'opacity-50 cursor-not-allowed': !state.currentTrack.streamUrl }"
          >
            <span class="text-lg">{{ state.isPlaying ? '⏸️' : '▶️' }}</span>
          </button>
          
          <div class="hidden sm:flex items-center gap-3 w-48">
            <button 
              @click="actions.toggleMute" 
              class="text-gray-400 hover:text-[#F6B17A] transition-colors"
            >
              {{ state.isMuted ? '🔇' : state.volume > 0.5 ? '🔊' : state.volume > 0 ? '🔉' : '🔈' }}
            </button>
            
            <input 
              type="range" 
              :value="state.volume"
              min="0" 
              max="1" 
              step="0.01"
              class="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-700 volume-slider"
              @input="onVolumeInput"
              :style="{
                '--volume-percentage': volumePercentage
              }"
            >
          </div>
        </div>

        <!-- Track Info -->
        <div class="hidden md:flex items-center gap-4 text-sm text-gray-500">
          <span class="flex items-center gap-1">
            <span class="w-1 h-1 bg-[#F6B17A] rounded-full"></span>
            {{ state.currentTrack.bitrate }}kbps
          </span>
          <span class="flex items-center gap-1">
            <span class="w-1 h-1 bg-[#F6B17A] rounded-full"></span>
            {{ state.currentTrack.format }}
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- Spacer to prevent content from being hidden behind fixed player -->
  <div class="h-24"></div>
</template>

<script lang="ts">
// Default export definition
export default {
  name: 'AudioPlayer'
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAudioState } from '~/composables/useAudioState'

const { state, actions } = useAudioState()

// Default fallback images
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
  // Lastly, use a data URL as final fallback
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
]

const currentFallbackIndex = ref(0)

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  if (currentFallbackIndex.value < FALLBACK_IMAGES.length) {
    img.src = FALLBACK_IMAGES[currentFallbackIndex.value]
    currentFallbackIndex.value++
  }
}

const volumePercentage = computed(() => `${state.volume * 100}%`)

const onVolumeInput = (event: Event) => {
  const newVolume = parseFloat((event.target as HTMLInputElement).value)
  actions.updateVolume(newVolume)
}

defineExpose({})
</script>

<style scoped>
.volume-slider {
  background: linear-gradient(to right, #F6B17A 0%, #F6B17A var(--volume-percentage), #374151 var(--volume-percentage), #374151 100%);
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: #F6B17A;
  border: 2px solid #1F2937;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: #F6B17A;
  border: 2px solid #1F2937;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}
</style> 