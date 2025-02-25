<template>
  <div class="min-h-screen bg-gray-900">

    <!--Advert Banner-->
    <div class="container mx-auto py-4">
      <div class="w-[728px] h-[90px] mx-auto bg-gray-800 rounded-lg overflow-hidden border border-gray-700 relative group">
        <img 
          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=728&h=90&fit=crop"
          alt="Advertisement"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        >
        <div class="absolute top-1 right-1 bg-gray-900/60 text-xs text-gray-400 px-2 py-0.5 rounded">
          Advertisement
        </div>
      </div>
    </div>
    <!--Advert Banner-->

    <!-- Updated Station List -->
    <div class="container mx-auto p-4 mt-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-white flex items-center gap-2">
          <span class="w-2 h-2 bg-[#F6B17A] rounded-full"></span>
          {{ currentStationId ? currentTrack.category || 'Now Playing' : 'Featured Stations' }}
        </h2>
        <button 
          @click="fetchStations" 
          class="text-gray-400 hover:text-[#F6B17A] transition-colors"
          :disabled="isLoading"
        >
          🔄 Refresh
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center p-12 bg-gray-800 rounded-xl">
        <div class="w-12 h-12 border-4 border-[#F6B17A] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-gray-400">Loading radio stations...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-900/20 border border-red-500/50 rounded-xl p-8 text-center">
        <p class="text-red-400 mb-4">{{ error }}</p>
        <button 
          @click="fetchStations"
          class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!stations.length" class="bg-gray-800 rounded-xl p-8 text-center">
        <p class="text-gray-400 mb-4">No radio stations available</p>
        <button 
          @click="fetchStations"
          class="px-4 py-2 bg-[#F6B17A] text-gray-900 rounded-lg hover:bg-[#e5a06b] transition-colors"
        >
          Refresh Stations
        </button>
      </div>

      <!-- Stations Grid -->
      <div class="station-grid">
        <div 
          v-for="station in stations" 
          :key="station.id" 
          :class="[
            'station-card',
            currentStationId === station.id 
              ? 'border-[#F6B17A]' 
              : 'border-gray-700 hover:border-[#F6B17A]',
            'group'
          ]"
          @click="selectStation(station)"
        >
          <div class="flex items-center gap-3 sm:gap-4 mb-4">
            <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <img 
                :src="station.logo" 
                :alt="station.name"
                class="w-full h-full object-cover"
                @error="e => e.target.src = placeholderImage"
              >
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-white group-hover:text-[#F6B17A] transition-colors truncate">
                {{ station.name }}
              </h3>
              <p class="text-sm text-gray-400 truncate">
                {{ station.genre }} • {{ station.country }}
              </p>
            </div>
          </div>
          <div class="flex items-center justify-between text-sm text-gray-500">
            <span class="flex items-center gap-2">
              <span class="w-1 h-1 bg-[#F6B17A] rounded-full"></span>
              {{ station.listeners }} clicks
            </span>
            <span class="flex items-center gap-2">
              <span class="w-1 h-1 bg-[#F6B17A] rounded-full"></span>
              {{ station.bitrate }}kbps
            </span>
          </div>
          <div class="mt-2 text-xs text-gray-500">
            Last checked: {{ station.lastChecked }}
          </div>
        </div>
      </div>
    </div>

    <!-- Remove the old player section and use the new component -->
    <AudioPlayer 
      :current-track="currentTrack"
      :is-playing="isPlaying"
      :volume="volume"
      :is-muted="isMuted"
      @play-pause="handlePlayPause"
      @update-volume="updateVolume"
      @toggle-mute="toggleMute"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAudioState } from '~/composables/useAudioState'
import AudioPlayer from '~/components/AudioPlayer.vue'

const { state, actions } = useAudioState()

interface Station {
  id: string
  name: string
  genre: string
  logo: string
  listeners: number
  bitrate: number
  streamUrl: string
  mountPoint: string
  codec: string
  country: string
  votes: number
  lastChecked: string
  status: string
}

const stations = ref<Station[]>([])
const error = ref<string | null>(null)
const isLoading = ref(false)
const currentStationId = ref<string | null>(null)

// Base64 placeholder image
const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

const fetchStations = async () => {
  try {
    error.value = null
    isLoading.value = true
    
    // Fetch Malawi stations with parameters for better results
    const response = await fetch('https://de1.api.radio-browser.info/json/stations/bycountry/malawi?' + new URLSearchParams({
      hidebroken: 'true',
      order: 'clickcount',
      reverse: 'true'
    }))

    if (!response.ok) {
      throw new Error('Failed to fetch radio stations')
    }

    const data = await response.json()
    
    // Filter stations to ensure they have valid streams
    const validStations = data.filter((station: any) => 
      station.url_resolved &&
      station.url_resolved.trim() !== '' &&
      station.lastcheckok === 1
    )
    
    if (!validStations.length) {
      throw new Error('No active radio stations found in Malawi')
    }
    
    // Map all valid stations (removed limit since Malawi might have fewer stations)
    stations.value = validStations.map((station: any) => ({
      id: station.stationuuid,
      name: station.name,
      genre: station.tags.split(',')[0] || 'Various',
      logo: station.favicon || placeholderImage,
      listeners: station.clickcount || 0,
      bitrate: station.bitrate || 128,
      streamUrl: station.url_resolved,
      mountPoint: station.url,
      codec: station.codec || 'MP3',
      country: 'Malawi',
      votes: station.votes,
      lastChecked: new Date(station.lastchecktime).toLocaleDateString(),
      status: station.lastcheckok === 1 ? 'Online' : 'Offline'
    }))
  } catch (err: unknown) {
    console.error('Error fetching stations:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load Malawi radio stations'
  } finally {
    isLoading.value = false
  }
}

const selectStation = async (station: Station) => {
  try {
    isLoading.value = true
    error.value = null
    
    // Update track info
    actions.setTrack({
      title: station.name,
      artist: station.country,
      artwork: station.logo || placeholderImage,
      bitrate: station.bitrate.toString(),
      format: station.codec,
      streamUrl: station.streamUrl,
      mimeType: 'audio/mpeg',
      category: station.genre || 'Radio Station'
    })

    // Initialize and play audio
    await actions.initializeAudio(station.streamUrl)
    currentStationId.value = station.id
    
  } catch (err: unknown) {
    console.error('Error playing station:', err)
    error.value = 'Failed to play this station. Please try another one.'
  } finally {
    isLoading.value = false
  }
}

// Fetch stations on component mount
onMounted(() => {
  fetchStations()
  actions.updateVolume() // Set initial volume slider gradient
})

// Cleanup on unmount
onBeforeUnmount(() => {
  actions.stopAudio()
})
</script>

<style scoped>
.container {
  max-width: 1400px;
}

.custom-audio-player {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 8px;
}

.custom-audio-player::-webkit-media-controls-panel {
  background-color: rgba(255, 255, 255, 0.05);
}

.custom-audio-player::-webkit-media-controls-current-time-display,
.custom-audio-player::-webkit-media-controls-time-remaining-display {
  color: #9CA3AF;
}

.custom-audio-player::-webkit-media-controls-play-button,
.custom-audio-player::-webkit-media-controls-volume-slider {
  filter: invert(0.8);
}

/* Add hover effect for audio controls */
.custom-audio-player::-webkit-media-controls-play-button:hover,
.custom-audio-player::-webkit-media-controls-mute-button:hover {
  opacity: 0.7;
}

input[type="range"] {
  -webkit-appearance: none;
  background: rgba(246, 177, 122, 0.2);
  border-radius: 9999px;
  height: 0.5rem;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1rem;
  height: 1rem;
  background: #F6B17A;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  background: #e5a06b;
}

input[type="range"]::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  background: #F6B17A;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

input[type="range"]::-moz-range-thumb:hover {
  transform: scale(1.1);
  background: #e5a06b;
}

/* Update volume slider styling */
.volume-slider {
  background: linear-gradient(to right, #F6B17A 0%, #F6B17A var(--volume-percentage), #374151 var(--volume-percentage), #374151 100%);
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #F6B17A;
  border: 2px solid #1F2937;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background: #e5a06b;
}

.volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #F6B17A;
  border: 2px solid #1F2937;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.volume-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  background: #e5a06b;
}
</style> 