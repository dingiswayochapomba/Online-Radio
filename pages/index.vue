<template>
  <div class="min-h-screen bg-gray-900">

    <!--Advert Banner-->
    <div class="container mx-auto p-4">
      <div class="max-w-[728px] h-[90px] sm:h-[90px] mx-auto bg-gray-800 rounded-lg overflow-hidden border border-gray-700 relative group">
        <img 
          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=728&h=90&fit=crop"
          alt="Advertisement"
          class="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        >
        <div class="absolute top-1 right-1 bg-gray-900/60 text-[10px] sm:text-xs text-gray-400 px-1.5 sm:px-2 py-0.5 rounded">
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
        >
          🔄 Refresh
        </button>
      </div>

      <!-- Station States -->
      <div v-if="isLoading" class="bg-gray-800 rounded-xl p-8 text-center">
        <p class="text-gray-400">Loading stations...</p>
      </div>
      
      <div v-else-if="!stations.length" class="bg-gray-800 rounded-xl p-8 text-center">
        <p class="text-gray-400 mb-4">No radio stations available</p>
        <button 
          @click="fetchStations"
          class="px-4 py-2 bg-[#F6B17A] text-gray-900 rounded-lg hover:bg-[#e5a06b] transition-colors"
        >
          Refresh Stations
        </button>
      </div>

      <!-- Malawi Stations Grid -->
      <div v-else class="station-grid mb-12">
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

      <!-- Featured Stations Section -->
      <div v-if="featuredStations.length" class="mt-16">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-white flex items-center gap-2">
            <span class="w-2 h-2 bg-[#F6B17A] rounded-full"></span>
            Featured Categories
          </h2>
        </div>

        <!-- Group stations by category -->
        <div v-for="category in ['Gospel', 'Top News', 'Top Jazz', 'Hip Hop']" :key="category" class="mb-12">
          <h3 class="text-lg font-medium text-gray-300 mb-4">{{ category }}</h3>
          <div class="station-grid">
            <div 
              v-for="station in category === 'Gospel' ? [...featuredStations.filter(s => s.categoryLabel === category), 
                {
                  id: 'radio-maria-mw',
                  name: 'Radio Maria Malawi',
                  genre: 'Gospel',
                  logo: 'https://radiomaria.mw/wp-content/uploads/2020/03/cropped-radio-maria-malawi-logo.png',
                  listeners: 1500,
                  bitrate: 128,
                  streamUrl: 'https://dreamsiteradiocp2.com/proxy/rmmw?mp=/stream',
                  mountPoint: '/stream',
                  codec: 'MP3',
                  country: 'Malawi',
                  lastChecked: new Date().toLocaleDateString(),
                  categoryLabel: 'Gospel'
                },
                {
                  id: 'transworld-africa',
                  name: 'Transworld Radio Africa',
                  genre: 'Gospel',
                  logo: 'https://www.twrafrica.org/wp-content/uploads/2019/01/twr-logo.png',
                  listeners: 1200,
                  bitrate: 128,
                  streamUrl: 'https://tx.sharp-stream.com/http_live.php?i=twrafrica.mp3',
                  mountPoint: '/live',
                  codec: 'MP3',
                  country: 'Malawi',
                  lastChecked: new Date().toLocaleDateString(),
                  categoryLabel: 'Gospel'
                },
                {
                  id: 'hope-radio-mw',
                  name: 'Hope Radio Malawi',
                  genre: 'Gospel',
                  logo: placeholderImage,
                  listeners: 950,
                  bitrate: 128,
                  streamUrl: 'http://stream.hopefm.mw:8000/stream',
                  mountPoint: '/stream',
                  codec: 'MP3',
                  country: 'Malawi',
                  lastChecked: new Date().toLocaleDateString(),
                  categoryLabel: 'Gospel'
                }
              ] : featuredStations.filter(s => s.categoryLabel === category)"
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
      </div>
    </div>

    <!-- Error State Popup -->
    <div 
      v-if="error" 
      class="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-red-900/95 border border-red-500/50 rounded-xl p-4 shadow-lg flex items-center gap-4 max-w-md w-full mx-4"
    >
      <p class="text-red-200 flex-1">{{ error }}</p>
      <div class="flex gap-2">
        <button 
          @click="error = null"
          class="p-2 text-red-300 hover:text-red-100 transition-colors"
        >
          ✕
        </button>
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
  category?: string
  categoryLabel?: string
}

const stations = ref<Station[]>([])
const error = ref<string | null>(null)
const isLoading = ref(false)
const currentStationId = ref<string | null>(null)
const featuredStations = ref<Station[]>([])

// Base64 placeholder image
const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

const fetchStations = async () => {
  try {
    error.value = null
    
    const response = await fetch('https://de1.api.radio-browser.info/json/stations/bycountry/malawi?' + new URLSearchParams({
      hidebroken: 'true',
      order: 'clickcount',
      reverse: 'true'
    }))

    if (!response.ok) {
      throw new Error('Failed to fetch radio stations')
    }

    const data = await response.json()
    
    // First, separate Islamic Broadcasting stations
    const islamicStations = data.filter((station: any) => 
      station.url_resolved &&
      station.url_resolved.trim() !== '' &&
      station.lastcheckok === 1 &&
      station.name.toLowerCase().includes('islamic broadcasting')
    )

    // Get other valid stations
    const otherStations = data.filter((station: any) => 
      station.url_resolved &&
      station.url_resolved.trim() !== '' &&
      station.lastcheckok === 1 &&
      !station.name.toLowerCase().includes('islamic broadcasting')
    )
    
    // Combine stations with only one Islamic Broadcasting station
    const validStations = [
      ...(islamicStations.length > 0 ? [islamicStations[0]] : []),
      ...otherStations
    ]
    
    if (!validStations.length) {
      throw new Error('No active radio stations found in Malawi')
    }
    
    // Add Times Radio to the stations list
    const timesRadio = {
      id: 'times-radio-mw',
      name: 'Times Radio',
      genre: 'News',
      logo: 'https://timesmediamw.com/wp-content/uploads/2021/03/times-radio.jpg',
      listeners: 1800,
      bitrate: 128,
      streamUrl: 'https://ice31.securenetsystems.net/TIMESFM',
      mountPoint: '/TIMESFM',
      codec: 'MP3',
      country: 'Malawi',
      votes: 0,
      lastChecked: new Date().toLocaleDateString(),
      status: 'Online'
    }
    
    stations.value = [
      timesRadio,
      ...validStations.map((station: any) => ({
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
    ]
  } catch (err: unknown) {
    console.error('Error fetching stations:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load Malawi radio stations'
  }
}

const fetchFeaturedStations = async () => {
  try {
    // Helper function to fetch and format stations for a specific category
    const fetchCategoryStations = async (params: Record<string, string>) => {
      const response = await fetch('https://de1.api.radio-browser.info/json/stations/search?' + new URLSearchParams({
        limit: '4',
        hidebroken: 'true',
        order: 'clickcount',
        reverse: 'true',
        ...params
      }))

      if (!response.ok) throw new Error('Failed to fetch stations')
      
      const data = await response.json()
      return data
        .filter((station: any) => station.url_resolved && station.lastcheckok === 1)
        .map((station: any) => ({
          id: station.stationuuid,
          name: station.name,
          genre: station.tags.split(',')[0] || 'Various',
          logo: station.favicon || placeholderImage,
          listeners: station.clickcount || 0,
          bitrate: station.bitrate || 128,
          streamUrl: station.url_resolved,
          mountPoint: station.url,
          codec: station.codec || 'MP3',
          country: station.country || 'Unknown',
          votes: station.votes,
          lastChecked: new Date(station.lastchecktime).toLocaleDateString(),
          status: station.lastcheckok === 1 ? 'Online' : 'Offline',
          category: station.tags,
          categoryLabel: station.tags.split(',')[0] || 'Various'
        }))
    }

    // Special function for news stations to target specific stations
    const fetchNewsStations = async () => {
      try {
        // First try to fetch specific news stations
        const specificNewsResponse = await fetch('https://de1.api.radio-browser.info/json/stations/search?' + new URLSearchParams({
          hidebroken: 'true',
          order: 'clickcount',
          reverse: 'true',
          name: 'BBC World,BBC World Service,Aljazeera,CNN,Voice of America,VOA,Sky News',
          language: 'english'
        }))

        if (!specificNewsResponse.ok) throw new Error('Failed to fetch news stations')
        
        let newsData = await specificNewsResponse.json()
        
        // If we don't have enough specific stations, fetch additional top English news stations
        if (newsData.length < 4) {
          const additionalNewsResponse = await fetch('https://de1.api.radio-browser.info/json/stations/search?' + new URLSearchParams({
            limit: '8',
            hidebroken: 'true',
            order: 'clickcount',
            reverse: 'true',
            tag: 'news',
            language: 'english'
          }))

          if (additionalNewsResponse.ok) {
            const additionalNews = await additionalNewsResponse.json()
            // Combine and remove duplicates based on station ID
            newsData = [...newsData, ...additionalNews]
              .filter((station: any) => 
                // Filter out unwanted stations
                !['BBC Radio 4 (128k)', 'BBC Radio 4'].includes(station.name) &&
                !station.name.toLowerCase().includes('best ibiza deep house') &&
                // Remove duplicates
                station.url_resolved && 
                station.lastcheckok === 1
              )
          }
        }

        // Process and return the news stations
        return newsData
          .slice(0, 8) // Take top 8 stations
          .map((station: any) => ({
            id: station.stationuuid,
            name: station.name,
            genre: 'News',
            logo: station.favicon || placeholderImage,
            listeners: station.clickcount || 0,
            bitrate: station.bitrate || 128,
            streamUrl: station.url_resolved,
            mountPoint: station.url,
            codec: station.codec || 'MP3',
            country: station.country || 'International',
            votes: station.votes,
            lastChecked: new Date(station.lastchecktime).toLocaleDateString(),
            status: station.lastcheckok === 1 ? 'Online' : 'Offline',
            category: 'news',
            categoryLabel: 'Top News'
          }))
      } catch (err) {
        console.error('Error fetching news stations:', err)
        return []
      }
    }

    // Fetch all categories with the special news handling
    const [gospelStations, newsStations, jazzStations, hipHopStations] = await Promise.all([
      fetchCategoryStations({ tag: 'gospel,christian' }),
      fetchNewsStations(), // Use the special news fetch function
      fetchCategoryStations({ tag: 'jazz' }),
      fetchCategoryStations({ tag: 'hiphop,rap' })
    ])

    // Update the category labels
    featuredStations.value = [
      ...gospelStations.map((s: Station) => ({ ...s, categoryLabel: 'Gospel' })),
      ...newsStations.map((s: Station) => ({ ...s, categoryLabel: 'Top News' })),
      ...jazzStations.map((s: Station) => ({ ...s, categoryLabel: 'Top Jazz' })),
      ...hipHopStations.map((s: Station) => ({ ...s, categoryLabel: 'Hip Hop' }))
    ]
  } catch (err) {
    console.error('Error fetching featured stations:', err)
  }
}

const selectStation = async (station: Station) => {
  if (currentStationId.value === station.id && state.isPlaying) {
    // If clicking the same station that's playing, pause it
    actions.handlePlayPause()
    return
  }

  try {
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
    currentStationId.value = null
  }
}

// Fetch stations on component mount
onMounted(async () => {
  await Promise.all([
    fetchStations(),
    fetchFeaturedStations()
  ])
  actions.updateVolume(1)
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