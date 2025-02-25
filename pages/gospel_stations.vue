<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Add this button at the top of your player section -->
    <div v-if="!isPlaying" class="container mx-auto mt-8 p-4 text-center">
      <button 
        @click="autoPlayZodiak"
        class="px-6 py-3 bg-[#F6B17A] rounded-full text-gray-900 font-semibold hover:bg-[#e5a06b] transition-colors"
        :disabled="isPlaybackLoading"
      >
        {{ isPlaybackLoading ? 'Loading...' : 'Play Zodiak Radio' }}
      </button>
    </div>

    <!-- Now Playing Section -->
    <div ref="playerSection" class="container mx-auto mt-8 p-4">
      <div class="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
        <div class="flex flex-col md:flex-row gap-8 items-center">
          <div class="w-48 h-48 relative group">
            <img 
              :src="currentTrack.artwork"
              :alt="currentTrack.title"
              class="w-full h-full object-cover rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
              @error="handleImageError"
            >
            <div class="absolute -bottom-3 -right-3 bg-[#F6B17A] px-4 py-1 rounded-full text-gray-900 text-sm font-semibold">
              {{ isPlaybackLoading ? 'Loading...' : isPlaying ? 'Live' : 'Ready' }}
            </div>
          </div>
          <div class="flex-1 space-y-4">
            <div>
              <h2 class="text-2xl font-bold text-white mb-2">
                {{ currentTrack.title }}
              </h2>
              <p class="text-gray-400">
                {{ currentTrack.artist }}
              </p>
            </div>
            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-4">
                <button 
                  @click="handlePlayPause" 
                  class="w-12 h-12 rounded-full bg-[#F6B17A] flex items-center justify-center hover:bg-[#e5a06b] transition-colors"
                >
                  <span class="text-xl text-gray-900">
                    {{ isPlaying ? '⏸️' : '▶️' }}
                  </span>
                </button>
                
                <div class="flex items-center gap-3 flex-1">
                  <button 
                    @click="toggleMute" 
                    class="text-gray-400 hover:text-[#F6B17A] transition-colors"
                  >
                    {{ isMuted ? '🔇' : volume > 0.5 ? '🔊' : volume > 0 ? '🔉' : '🔈' }}
                  </button>
                  
                  <input 
                    type="range" 
                    v-model="volume" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    class="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-700"
                    @input="updateVolume"
                  >
                </div>
              </div>
            </div>

            <div class="flex items-center gap-4 text-sm text-gray-500">
              <span class="flex items-center gap-1">
                <span class="w-1 h-1 bg-[#F6B17A] rounded-full"></span>
                {{ currentTrack.bitrate }}kbps
              </span>
              <span class="flex items-center gap-1">
                <span class="w-1 h-1 bg-[#F6B17A] rounded-full"></span>
                {{ currentTrack.format }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Station List -->
    <div class="container mx-auto p-4 mt-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-white flex items-center gap-2">
          <span class="w-2 h-2 bg-[#F6B17A] rounded-full"></span>
          Radio Stations
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
        <p class="text-gray-400">Loading gospel stations...</p>
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

      <!-- Stations Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="station in stations" 
          :key="station.id" 
          :class="[
            'bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 border',
            currentStationId === station.id 
              ? 'border-[#F6B17A]' 
              : 'border-gray-700 hover:border-[#F6B17A]',
            'group'
          ]"
          @click="selectStation(station)"
        >
          <div class="flex items-center gap-4 mb-4">
            <div class="w-14 h-14 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <img 
                :src="station.logo" 
                :alt="station.name"
                class="w-full h-full object-cover"
                @error="handleImageError"
              >
            </div>
            <div>
              <h3 class="font-semibold text-white group-hover:text-[#F6B17A] transition-colors">
                {{ station.name }}
              </h3>
              <p class="text-sm text-gray-400">
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
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="stations.length" class="mt-8 flex justify-center items-center gap-4">
        <button 
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-[#F6B17A] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <div class="flex items-center gap-2">
          <button 
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
              currentPage === page 
                ? 'bg-[#F6B17A] text-gray-900' 
                : 'bg-gray-800 text-gray-400 hover:text-[#F6B17A]'
            ]"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-[#F6B17A] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Radio Stations - VybeStream-Radio',
  meta: [
    {
      name: 'description',
      content: 'Listen to top radio stations from around the world'
    }
  ]
})

// Initialize reactive variables
const playerSection = ref<HTMLElement | null>(null)
const audioStream = ref<HTMLAudioElement | null>(null)
const isLoading = ref(false)
const stations = ref<Station[]>([])
const error = ref<string | null>(null)
const isPlaying = ref(false)
const currentStationId = ref<string | null>(null)
const volume = ref(1)
const isMuted = ref(false)
const previousVolume = ref(1)
const currentPage = ref(1)
const stationsPerPage = 5
const totalStations = ref(0)
const isPlaybackLoading = ref(false)

// Base64 placeholder image
const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

// Initialize current track data
const currentTrack = ref({
  title: 'Zodiak Broadcasting Station',
  artist: 'Malawi',
  artwork: 'https://zodiak.mw/images/logo.png', // Using a placeholder logo URL
  bitrate: '128',
  format: 'MP3',
  streamUrl: 'https://ice31.securenetsystems.net/ZODIAKB', // Zodiak's stream URL
  mimeType: 'audio/mpeg'
})

// Compute total pages
const totalPages = computed(() => Math.ceil(totalStations.value / stationsPerPage))

// Update the interface for OnlineRadioBox station data
interface OnlineRadioBoxStation {
  id?: string
  name?: string
  url?: string
  stream?: string
  logo?: string
  favicon?: string
  country?: string
  genre?: string | string[]
  bitrate?: number
  listeners?: number
  codec?: string
  [key: string]: any // Allow for additional unknown properties
}

// Add interface for the station we use in our app
interface Station {
  id: string
  name: string
  genre: string
  logo: string
  listeners: number
  bitrate: number
  streamUrl: string
  country: string
  codec: string
  status: string
}

const CORS_PROXY = 'https://api.allorigins.win/raw?url='

// Add Malawian radio stations data
const malawiStations: Station[] = [
  {
    id: 'timveni',
    name: 'Timveni Radio',
    genre: 'Youth Radio',
    logo: 'https://timveni.com/wp-content/uploads/2019/03/timveni-logo.png', // Replace with actual logo
    listeners: 0,
    bitrate: 128,
    streamUrl: 'https://stream.zeno.fm/q8wd4yxm7k0uv', // Timveni stream URL
    country: 'Malawi',
    codec: 'MP3',
    status: 'Online'
  },
  {
    id: 'mij',
    name: 'MIJ FM',
    genre: 'News & Entertainment',
    logo: 'https://mijfm.com/wp-content/uploads/2020/01/mij-fm-logo.png', // Replace with actual logo
    listeners: 0,
    bitrate: 128,
    streamUrl: 'https://stream.zeno.fm/6vw2gc5g0uhvv', // MIJ FM stream URL
    country: 'Malawi',
    codec: 'MP3',
    status: 'Online'
  },
  {
    id: 'times',
    name: 'Times Radio',
    genre: 'News & Entertainment',
    logo: 'https://times.mw/wp-content/uploads/2020/01/times-radio-logo.png', // Replace with actual logo
    listeners: 0,
    bitrate: 128,
    streamUrl: 'https://stream.zeno.fm/hgvk475g0uhvv', // Times Radio stream URL
    country: 'Malawi',
    codec: 'MP3',
    status: 'Online'
  },
  {
    id: 'zodiak',
    name: 'Zodiak Broadcasting',
    genre: 'News & Entertainment',
    logo: 'https://zodiak.mw/images/logo.png',
    listeners: 0,
    bitrate: 128,
    streamUrl: 'https://ice31.securenetsystems.net/ZODIAKB',
    country: 'Malawi',
    codec: 'MP3',
    status: 'Online'
  },
  {
    id: 'chanco',
    name: 'CHANCO Radio',
    genre: 'University Radio',
    logo: placeholderImage,
    listeners: 0,
    bitrate: 128,
    streamUrl: 'https://stream.zeno.fm/nktz0gg7quhvv', // CHANCO Radio stream URL
    country: 'Malawi',
    codec: 'MP3',
    status: 'Online'
  }
]

// Add the Radio Browser API base URL
const RADIO_BROWSER_API = 'https://de1.api.radio-browser.info/json/stations'

// Modify the fetchStations function
const fetchStations = async () => {
  try {
    error.value = null
    isLoading.value = true
    
    // First, add Malawian stations
    const localStations = [...malawiStations]
    
    // Fetch gospel stations from Radio Browser API
    const params = new URLSearchParams({
      limit: '30',
      offset: ((currentPage.value - 1) * stationsPerPage).toString(),
      tagList: 'gospel',
      hidebroken: 'true',
      order: 'votes', // Sort by popularity
      reverse: 'true'
    })

    const response = await fetch(`${RADIO_BROWSER_API}/search?${params}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch gospel radio stations')
    }

    const data = await response.json()
    
    // Map the Radio Browser stations to our Station interface
    const gospelStations = data.map((station: any): Station => ({
      id: station.stationuuid || String(Math.random()),
      name: station.name || 'Unknown Station',
      genre: station.tags || 'Gospel',
      logo: station.favicon || station.url_resolved || placeholderImage,
      listeners: station.clickcount || 0,
      bitrate: station.bitrate || 128,
      streamUrl: station.url_resolved || station.url,
      country: station.country || 'Unknown',
      codec: station.codec || 'MP3',
      status: 'Online'
    })).filter((station: Station) => station.streamUrl) // Filter out stations without stream URLs

    // Combine local and fetched stations
    stations.value = [...localStations, ...gospelStations]
    totalStations.value = stations.value.length

    // Apply pagination
    const start = (currentPage.value - 1) * stationsPerPage
    const end = start + stationsPerPage
    stations.value = stations.value.slice(start, end)

  } catch (err: any) {
    console.error('Error fetching stations:', err)
    error.value = err.message || 'Failed to load gospel stations'
    // Still show Malawian stations even if API fails
    stations.value = malawiStations
    totalStations.value = malawiStations.length
  } finally {
    isLoading.value = false
  }
}

// Update the tryAlternativeStream function to handle Radio Browser streams
const tryAlternativeStream = async (station: Station) => {
  // For Radio Browser stations, try the direct stream URL first
  if (!station.id.includes('local_')) {
    try {
      const audio = new Audio(station.streamUrl)
      await audio.play()
      audio.pause()
      return station.streamUrl
    } catch (err) {
      console.warn(`Failed to play stream: ${station.streamUrl}`, err)
    }
  }

  // Alternative stream URLs for Malawian stations
  const alternativeStreams: Record<string, string[]> = {
    'timveni': [
      'https://stream.zeno.fm/q8wd4yxm7k0uv',
      'https://stream.radiojar.com/timveni'
    ],
    'mij': [
      'https://stream.zeno.fm/6vw2gc5g0uhvv',
      'https://stream.radiojar.com/mijfm'
    ],
    // Add alternative URLs for other local stations...
  }

  const streams = alternativeStreams[station.id] || []
  
  for (const streamUrl of streams) {
    try {
      const audio = new Audio(streamUrl)
      await audio.play()
      audio.pause()
      return streamUrl
    } catch (err) {
      console.warn(`Failed to play stream: ${streamUrl}`, err)
    }
  }
  
  return station.streamUrl // Return original if no alternatives work
}

// Modify selectStation to use tryAlternativeStream
const selectStation = async (station: Station) => {
  try {
    isPlaybackLoading.value = true
    error.value = null
    
    if (audioStream.value) {
      audioStream.value.pause()
      audioStream.value.src = ''
      audioStream.value = null
    }

    // Try to get working stream URL
    const streamUrl = await tryAlternativeStream(station)
    
    currentStationId.value = station.id
    currentTrack.value = {
      title: station.name,
      artist: station.country,
      artwork: station.logo || placeholderImage,
      bitrate: station.bitrate.toString(),
      format: station.codec,
      streamUrl: streamUrl,
      mimeType: 'audio/mpeg'
    }

    const audio = new Audio(streamUrl)
    audio.crossOrigin = 'anonymous'
    audio.volume = volume.value
    audioStream.value = audio
    
    audio.addEventListener('playing', () => {
      isPlaying.value = true
      error.value = null
      isPlaybackLoading.value = false
    })
    
    audio.addEventListener('pause', () => {
      isPlaying.value = false
    })
    
    audio.addEventListener('ended', () => {
      isPlaying.value = false
      error.value = 'Stream ended. Click play to retry.'
    })
    
    audio.addEventListener('error', (e: ErrorEvent) => {
      console.error('Audio stream error:', e)
      error.value = 'Stream error: Failed to play this station'
      isPlaying.value = false
      isPlaybackLoading.value = false
    })

    try {
      await audio.play()
      
      if (playerSection.value instanceof HTMLElement) {
        playerSection.value.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    } catch (playError) {
      console.error('Playback failed:', playError)
      error.value = 'Failed to play this station. Please try another one.'
      isPlaybackLoading.value = false
      throw playError
    }

  } catch (err: any) {
    console.error('Error playing station:', err)
    error.value = 'Failed to play this station. Please try another one.'
    isPlaybackLoading.value = false
  }
}

const handlePlayPause = async () => {
  if (!currentStationId.value) {
    error.value = 'Please select a station first'
    return
  }

  try {
    if (audioStream.value) {
      if (audioStream.value.paused) {
        error.value = null
        await audioStream.value.play()
      } else {
        audioStream.value.pause()
      }
    } else {
      error.value = 'No audio stream available. Please select a station first'
    }
  } catch (err: unknown) {
    // Type guard to handle the error properly
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
    console.error('Play/Pause failed:', errorMessage)
    error.value = 'Failed to control playback. Please try again.'
  }
}

const toggleMute = () => {
  if (audioStream.value) {
    if (isMuted.value) {
      volume.value = previousVolume.value
      isMuted.value = false
    } else {
      previousVolume.value = volume.value
      volume.value = 0
      isMuted.value = true
    }
    audioStream.value.volume = volume.value
  }
}

const updateVolume = () => {
  if (audioStream.value) {
    audioStream.value.volume = volume.value
    isMuted.value = volume.value === 0
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchStations()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

// Add type for the error event handler
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (target) {
    target.src = placeholderImage
  }
}

// Add autoplay function
const autoPlayZodiak = async () => {
  try {
    isPlaybackLoading.value = true
    error.value = null
    
    if (audioStream.value) {
      audioStream.value.pause()
      audioStream.value.src = ''
      audioStream.value = null
    }

    const audio = new Audio(currentTrack.value.streamUrl)
    audio.crossOrigin = 'anonymous'
    audio.volume = volume.value
    audioStream.value = audio
    
    audio.addEventListener('playing', () => {
      isPlaying.value = true
      error.value = null
      isPlaybackLoading.value = false
    })
    
    audio.addEventListener('pause', () => {
      isPlaying.value = false
    })
    
    audio.addEventListener('ended', () => {
      isPlaying.value = false
      error.value = 'Stream ended. Click play to retry.'
    })
    
    audio.addEventListener('error', (e) => {
      console.error('Audio stream error:', e)
      error.value = 'Stream error: Failed to play Zodiak radio'
      isPlaying.value = false
      isPlaybackLoading.value = false
    })

    await audio.play()

  } catch (err: any) {
    console.error('Error playing Zodiak:', err)
    error.value = 'Failed to play Zodiak radio. Please try again.'
    isPlaybackLoading.value = false
  }
}

// Update onMounted to autoplay Zodiak
onMounted(() => {
  fetchStations()
  autoPlayZodiak() // Auto play Zodiak when component mounts
})

// Cleanup on component unmount
onBeforeUnmount(() => {
  if (audioStream.value) {
    audioStream.value.pause()
    audioStream.value.src = ''
    audioStream.value = null
  }
})
</script>

<style scoped>
.container {
  max-width: 1400px;
}

/* ... rest of the styles from news_stations.vue ... */
</style> 