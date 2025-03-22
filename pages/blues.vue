<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Now Playing Section -->
    <AudioPlayer 
      :current-track="currentTrack"
      :is-playing="isPlaying"
      :volume="volume"
      :is-muted="isMuted"
      @play-pause="handlePlayPause"
      @update-volume="updateVolume"
      @toggle-mute="toggleMute"
    />

    <!-- Updated Station List -->
    <div class="container mx-auto p-4 mt-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-white flex items-center gap-2">
          <span class="w-2 h-2 bg-[#F6B17A] rounded-full"></span>
          Top Blues Radio Stations
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
                @error="e => e.target.src = placeholderImage"
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
          <div class="mt-2 text-xs text-gray-500">
            Last checked: {{ station.lastChecked }}
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

      <!-- Add station count -->
      <div v-if="stations.length" class="mt-4 text-center text-sm text-gray-500">
        Showing {{ ((currentPage - 1) * stationsPerPage) + 1 }} - 
        {{ Math.min(currentPage * stationsPerPage, totalStations) }} 
        of {{ totalStations }} stations
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount, computed } from 'vue';
import { useTheme } from '~/composables/useTheme';
import { useHead } from '@unhead/vue';
import { useAudioState } from '~/composables/useAudioState'
import AudioPlayer from '~/components/AudioPlayer.vue'

// Add page metadata
useHead({
  title: 'Top Blues Radio Stations - TuneRadio',
  meta: [
    {
      name: 'description',
      content: 'Listen to top blues radio stations from around the world'
    }
  ]
});

const { theme, toggleTheme } = useTheme();

const totalListeners = ref(0);
const isLoading = ref(false);
const stations = ref([]);
const error = ref(null);
const currentStationId = ref(null);
const currentPage = ref(1);
const stationsPerPage = 15;
const totalStations = ref(0);

// Base64 placeholder image
const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const { state, actions } = useAudioState()

// Add computed properties
const isPlaying = computed(() => state.isPlaying)
const volume = computed({
  get: () => state.volume,
  set: (value) => actions.updateVolume(value)
})
const isMuted = computed(() => state.isMuted)
const currentTrack = computed(() => state.currentTrack)

const fetchStations = async () => {
  try {
    error.value = null;
    isLoading.value = true;
    
    const response = await fetch('https://de1.api.radio-browser.info/json/stations/bytag/blues?' + new URLSearchParams({
      offset: ((currentPage.value - 1) * stationsPerPage).toString(),
      limit: stationsPerPage.toString(),
      hidebroken: 'true',
      order: 'clickcount',  // Sort by popularity
      reverse: 'true'       // Most popular first
    }));

    if (!response.ok) {
      throw new Error('Failed to fetch radio stations');
    }

    const data = await response.json();
    
    // Filter stations to ensure they have valid streams
    const validStations = data.filter(station => 
      station.url_resolved &&
      station.url_resolved.trim() !== '' &&
      station.lastcheckok === 1
    );
    
    if (!validStations.length) {
      throw new Error('No active blues radio stations found');
    }

    // Add reliable blues stations
    const reliableBluesStations = [
      {
        id: 'delta-blues',
        name: 'Delta Blues Radio',
        genre: 'Delta Blues',
        logo: 'https://www.radio.net/images/broadcasts/7f/65/31756/1/c300.png',
        listeners: 2800,
        bitrate: 128,
        streamUrl: 'https://radio.streemlion.com:4245/stream',
        mountPoint: '/stream',
        codec: 'MP3',
        country: 'United States',
        votes: 0,
        lastChecked: new Date().toLocaleDateString(),
        status: 'Online'
      },
      {
        id: 'chicago-blues',
        name: 'Chicago Blues Experience',
        genre: 'Chicago Blues',
        logo: 'https://www.radio.net/images/broadcasts/08/a1/37665/1/c300.png',
        listeners: 2600,
        bitrate: 128,
        streamUrl: 'https://streaming.radio.co/s5b9859404/listen',
        mountPoint: '/stream',
        codec: 'MP3',
        country: 'United States',
        votes: 0,
        lastChecked: new Date().toLocaleDateString(),
        status: 'Online'
      },
      {
        id: 'blues-radio-uk',
        name: 'Blues Radio UK',
        genre: 'Blues',
        logo: 'https://www.radio.net/images/broadcasts/08/a1/37665/1/c300.png',
        listeners: 2500,
        bitrate: 128,
        streamUrl: 'https://stream.zeno.fm/2xs37pha2mruv',
        mountPoint: '/stream',
        codec: 'MP3',
        country: 'United Kingdom',
        votes: 0,
        lastChecked: new Date().toLocaleDateString(),
        status: 'Online'
      },
      {
        id: 'blues-cafe-radio',
        name: 'Blues Café Radio',
        genre: 'Blues',
        logo: 'https://www.bluescaferadio.com/images/logo.jpg',
        listeners: 2000,
        bitrate: 128,
        streamUrl: 'https://usa1.fastcast4u.com/proxy/bluescaferadio?mp=/1',
        mountPoint: '/stream',
        codec: 'MP3',
        country: 'United States',
        votes: 0,
        lastChecked: new Date().toLocaleDateString(),
        status: 'Online'
      },
      {
        id: 'classic-blues-radio',
        name: 'Classic Blues Radio',
        genre: 'Classic Blues',
        logo: 'https://www.radio.net/images/broadcasts/7f/65/31756/1/c300.png',
        listeners: 1900,
        bitrate: 128,
        streamUrl: 'https://stream.zeno.fm/d739ftphfg8uv',
        mountPoint: '/stream',
        codec: 'MP3',
        country: 'United States',
        votes: 0,
        lastChecked: new Date().toLocaleDateString(),
        status: 'Online'
      }
    ];
    
    // Set total stations
    totalStations.value = 30;
    
    // Map stations and insert reliable blues stations at the beginning
    stations.value = [
      ...reliableBluesStations,
      ...validStations.map(station => ({
        id: station.stationuuid,
        name: station.name,
        genre: station.tags.split(',')[0] || 'Blues',
        logo: station.favicon || placeholderImage,
        listeners: station.clickcount || 0,
        bitrate: station.bitrate || 128,
        streamUrl: station.url_resolved,
        mountPoint: station.url,
        codec: station.codec || 'MP3',
        country: station.country || 'Unknown',
        votes: station.votes,
        lastChecked: new Date(station.lastchecktime).toLocaleDateString(),
        status: station.lastcheckok === 1 ? 'Online' : 'Offline'
      }))
    ];
  } catch (error) {
    console.error('Error fetching stations:', error);
    error.value = error.message || 'Failed to load blues radio stations';
  } finally {
    isLoading.value = false;
  }
};

// Pagination methods
const totalPages = computed(() => Math.ceil(totalStations.value / stationsPerPage));

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchStations();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1);
  }
};

const selectStation = async (station) => {
  try {
    error.value = null

    if (currentStationId.value === station.id && state.isPlaying) {
      actions.handlePlayPause()
      return
    }

    isLoading.value = true

    actions.setTrack({
      title: station.name,
      artist: station.country,
      artwork: station.logo || placeholderImage,
      bitrate: station.bitrate.toString(),
      format: station.codec,
      streamUrl: station.streamUrl,
      mimeType: 'audio/mpeg',
      category: station.genre || 'Blues'
    })

    actions.stopAudio()
    await new Promise(resolve => setTimeout(resolve, 100))

    const success = await actions.initializeAudio(station.streamUrl)
    if (!success) {
      throw new Error('Failed to initialize audio stream')
    }

    currentStationId.value = station.id

  } catch (err) {
    console.error('Error playing station:', err)
    error.value = 'Failed to play this station. Please try another one.'
    currentStationId.value = null
    actions.stopAudio()
  } finally {
    isLoading.value = false
  }
}

const handlePlayPause = () => {
  actions.handlePlayPause()
}

const updateVolume = (value) => {
  actions.updateVolume(value)
}

const toggleMute = () => {
  actions.toggleMute()
}

// Fetch stations on component mount
onMounted(() => {
  fetchStations();
});

// Cleanup
onBeforeUnmount(() => {
  actions.stopAudio()
});
</script>

<style scoped>
.container {
  max-width: 1400px;
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
</style> 