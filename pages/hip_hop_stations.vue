<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Now Playing Section -->
    <div ref="playerSection" class="container mx-auto mt-8 p-4">
      <div class="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
        <div class="flex flex-col md:flex-row gap-8 items-center">
          <!-- Same player UI as news_stations.vue -->
          <div class="w-48 h-48 relative group">
            <img 
              :src="currentTrack.artwork"
              :alt="currentTrack.title"
              class="w-full h-full object-cover rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
              @error="e => e.target.src = placeholderImage"
            >
            <div class="absolute -bottom-3 -right-3 bg-[#F6B17A] px-4 py-1 rounded-full text-gray-900 text-sm font-semibold">
              {{ isPlaybackLoading ? 'Loading...' : isPlaying ? 'Live' : 'Ready' }}
            </div>
          </div>
          <!-- Rest of the player section identical to news_stations.vue -->
          <div class="flex-1 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-white">{{ currentTrack.title }}</h2>
                <p class="text-gray-400">{{ currentTrack.artist }}</p>
              </div>
              <div class="flex items-center gap-4">
                <button 
                  @click="handlePlayPause"
                  class="w-12 h-12 rounded-full bg-[#F6B17A] text-gray-900 flex items-center justify-center hover:bg-[#e5a06b] transition-colors"
                >
                  {{ isPlaying ? '⏸️' : '▶️' }}
                </button>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <button 
                @click="toggleMute"
                class="text-gray-400 hover:text-[#F6B17A] transition-colors"
              >
                {{ isMuted ? '🔇' : '🔊' }}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01"
                v-model="volume"
                @input="updateVolume($event.target.value)"
                class="flex-1"
              >
            </div>
            
            <div class="flex items-center gap-4 text-sm text-gray-500">
              <span>{{ currentTrack.bitrate }}kbps</span>
              <span>{{ currentTrack.format }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Updated Station List -->
    <div class="container mx-auto p-4 mt-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-white flex items-center gap-2">
          <span class="w-2 h-2 bg-[#F6B17A] rounded-full"></span>
          Top Gospel Radio Stations
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

      <!-- Empty State -->
      <div v-else-if="!stations.length" class="bg-gray-800 rounded-xl p-8 text-center">
        <p class="text-gray-400 mb-4">No gospel stations available</p>
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
      <!-- ... Copy the pagination section from news_stations.vue ... -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useTheme } from '~/composables/useTheme';
import { useHead } from '@unhead/vue';

// Page metadata
useHead({
  title: 'Gospel Radio Stations - TuneRadio',
  meta: [
    {
      name: 'description',
      content: 'Listen to top gospel radio stations from around the world'
    }
  ]
});

// State management
const { theme, toggleTheme } = useTheme();
const stations = ref([]);
const isLoading = ref(false);
const error = ref(null);
const currentPage = ref(1);
const stationsPerPage = 12;
const totalStations = ref(0);
const currentStationId = ref(null);
const isPlaying = ref(false);
const isPlaybackLoading = ref(false);
const volume = ref(0.8);
const isMuted = ref(false);
const audioStream = ref(null);
const playerSection = ref(null);

// Add this before other ref declarations
const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const currentTrack = ref({
  title: 'Welcome to Gospel Radio',
  artist: 'Select a station to start listening',
  artwork: placeholderImage,
  bitrate: '128',
  format: 'MP3',
  streamUrl: '',
  mimeType: 'audio/mpeg'
});

const fetchStations = async () => {
  try {
    error.value = null;
    isLoading.value = true;
    
    // First try to get English gospel stations
    const response = await fetch('https://de1.api.radio-browser.info/json/stations/search?' + new URLSearchParams({
      tag: 'gospel',
      language: 'english',  // Add language filter
      hidebroken: 'true',
      order: 'clickcount',
      reverse: 'true',
      offset: ((currentPage.value - 1) * stationsPerPage).toString(),
      limit: stationsPerPage.toString()
    }));

    if (!response.ok) {
      throw new Error('Failed to fetch gospel stations');
    }

    const data = await response.json();
    
    // Filter and prioritize some well-known gospel stations
    const priorityStations = [
      "K-LOVE Radio",
      "Air1 Radio",
      "Premier Gospel",
      "UCB Gospel",
      "Joy FM",
      "The Light",
      "Gospel Grace Radio",
      "Praise Radio",
      "Heaven 98.3",
      "Gospel Highway Eleven"
    ];
    
    // Filter stations and sort by priority
    const validStations = data
      .filter(station => 
      station.url_resolved &&
      station.url_resolved.trim() !== '' &&
      station.lastcheckok === 1
      )
      .sort((a, b) => {
        // Put priority stations first
        const aIsPriority = priorityStations.some(name => a.name.includes(name));
        const bIsPriority = priorityStations.some(name => b.name.includes(name));
        if (aIsPriority && !bIsPriority) return -1;
        if (!aIsPriority && bIsPriority) return 1;
        // Then sort by click count
        return (b.clickcount || 0) - (a.clickcount || 0);
      });
    
    if (!validStations.length) {
      throw new Error('No active gospel stations found');
    }
    
    // Update total stations count
    totalStations.value = Math.min(30, validStations.length);
    
    // Map stations
    stations.value = validStations.map(station => ({
      id: station.stationuuid,
      name: station.name,
      genre: 'Gospel',
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
      language: station.language || 'English'
    }));
  } catch (error) {
    console.error('Error fetching stations:', error);
    error.value = error.message || 'Failed to load gospel stations';
  } finally {
    isLoading.value = false;
  }
};

// Add these missing functions that were referenced in the template
const selectStation = async (station) => {
  try {
    if (audioStream.value) {
      audioStream.value.pause();
      audioStream.value.src = '';
    }

    currentStationId.value = station.id;
    isPlaybackLoading.value = true;
    
    // Update current track info
    currentTrack.value = {
      title: station.name,
      artist: station.genre,
      artwork: station.logo || placeholderImage,
      bitrate: station.bitrate,
      format: station.codec,
      streamUrl: station.streamUrl,
      mimeType: 'audio/mpeg'
    };

    // Initialize audio stream
    audioStream.value = new Audio(station.streamUrl);
    audioStream.value.volume = volume.value;
    
    // Add event listeners
    audioStream.value.addEventListener('playing', () => {
      isPlaying.value = true;
      isPlaybackLoading.value = false;
    });
    
    audioStream.value.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      error.value = 'Failed to play this station';
      isPlaybackLoading.value = false;
    });

    await audioStream.value.play();
    
    // Scroll to player section
    playerSection.value?.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    console.error('Error playing station:', err);
    error.value = 'Failed to play this station';
    isPlaybackLoading.value = false;
  }
};

const handlePlayPause = async () => {
  if (!audioStream.value) return;
  
  try {
    if (isPlaying.value) {
      audioStream.value.pause();
      isPlaying.value = false;
    } else {
      await audioStream.value.play();
      isPlaying.value = true;
    }
  } catch (err) {
    console.error('Playback control error:', err);
    error.value = 'Playback control failed';
  }
};

const toggleMute = () => {
  if (!audioStream.value) return;
  isMuted.value = !isMuted.value;
  audioStream.value.muted = isMuted.value;
};

const updateVolume = (newVolume) => {
  volume.value = newVolume;
  if (audioStream.value) {
    audioStream.value.volume = newVolume;
  }
};

// Computed properties for pagination
const totalPages = computed(() => Math.ceil(totalStations.value / stationsPerPage));
const canGoPrevious = computed(() => currentPage.value > 1);
const canGoNext = computed(() => currentPage.value < totalPages.value);

// Fetch stations on component mount
onMounted(() => {
  fetchStations();
});

// Add cleanup on component unmount
onBeforeUnmount(() => {
  if (audioStream.value) {
    audioStream.value.pause();
    audioStream.value.src = '';
    audioStream.value = null;
  }
});
</script>

<style scoped>
/* Copy the styles from news_stations.vue */
.container {
  max-width: 1400px;
}

/* ... Rest of the styles ... */
</style> 