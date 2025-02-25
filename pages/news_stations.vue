<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Now Playing Section -->
    <div ref="playerSection" class="container mx-auto mt-8 p-4">
      <div class="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
        <div class="flex flex-col md:flex-row gap-8 items-center">
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

    <!-- Updated Station List -->
    <div class="container mx-auto p-4 mt-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-white flex items-center gap-2">
          <span class="w-2 h-2 bg-[#F6B17A] rounded-full"></span>
          Top Radio Stations
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
        <p class="text-gray-400">Loading news stations...</p>
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
        <p class="text-gray-400 mb-4">No news stations available</p>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useTheme } from '~/composables/useTheme';
import { useHead } from '@unhead/vue';

// Update the page metadata
useHead({
  title: 'News Radio Stations - TuneRadio',
  meta: [
    {
      name: 'description',
      content: 'Listen to top English news radio stations from around the world'
    }
  ]
});

const { theme, toggleTheme } = useTheme();

const totalListeners = ref(0);
const audioStream = ref(null);
const isLoading = ref(false);
const stations = ref([]);
const error = ref(null);
const isPlaying = ref(false);
const currentStationId = ref(null);
const volume = ref(1);
const isMuted = ref(false);
const previousVolume = ref(1);
const currentPage = ref(1);
const stationsPerPage = 15;
const totalStations = ref(0);
const isPlaybackLoading = ref(false);
const playerSection = ref(null);

// Base64 placeholder image
const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const currentTrack = ref({
  title: 'Welcome to Top Radio Stations',
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
    
    // Request more stations than needed to account for filtering
    const response = await fetch('https://de1.api.radio-browser.info/json/stations/search?' + new URLSearchParams({
      tag: 'news',
      language: 'en',
      hidebroken: 'true',
      order: 'clickcount',
      reverse: 'true',
      offset: '0',  // Get all stations first, then we'll handle pagination client-side
      limit: '100'  // Request more stations to ensure we have enough after filtering
    }));

    if (!response.ok) {
      throw new Error('Failed to fetch news stations');
    }

    const data = await response.json();
    
    // More strict filtering for working stations
    const validStations = data.filter(station => 
      station.url_resolved &&
      station.url_resolved.trim() !== '' &&
      station.lastcheckok === 1 &&
      station.clickcount > 0 && // Must have some listeners
      station.bitrate >= 64 && // Reasonable quality
      !station.url_resolved.includes('undefined') &&
      !station.url_resolved.includes('null') &&
      // Common working stream formats
      (station.codec?.toLowerCase().includes('mp3') ||
       station.codec?.toLowerCase().includes('aac') ||
       station.url_resolved.toLowerCase().includes('.mp3') ||
       station.url_resolved.toLowerCase().includes('.aac'))
    );
    
    if (!validStations.length) {
      throw new Error('No active news stations found');
    }

    // Take only the first 60 valid stations
    const limitedStations = validStations.slice(0, 60);
    totalStations.value = limitedStations.length;
    
    // Calculate pagination slice
    const start = (currentPage.value - 1) * stationsPerPage;
    const end = start + stationsPerPage;
    
    // Map only the stations for current page
    stations.value = limitedStations.slice(start, end).map(station => ({
      id: station.stationuuid,
      name: station.name,
      genre: 'News',
      logo: station.favicon || placeholderImage,
      listeners: station.clickcount || 0,
      bitrate: station.bitrate || 128,
      streamUrl: station.url_resolved,
      mountPoint: station.url,
      codec: station.codec || 'MP3',
      country: station.country || 'Unknown',
      votes: station.votes,
      lastChecked: new Date(station.lastchecktime).toLocaleDateString(),
      status: 'Online'
    }));

  } catch (error) {
    console.error('Error fetching stations:', error);
    error.value = error.message || 'Failed to load news stations';
  } finally {
    isLoading.value = false;
  }
};

// Add pagination methods
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

// Add a function to verify stream before playing
const verifyStream = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
    return response.ok;
  } catch {
    return false;
  }
};

// Update the selectStation function
const selectStation = async (station) => {
  try {
    isPlaybackLoading.value = true;
    error.value = null;

    // Verify stream before attempting to play
    const isStreamValid = await verifyStream(station.streamUrl);
    if (!isStreamValid) {
      throw new Error('Stream is not currently available');
    }
    
    // Stop current stream if exists
    if (audioStream.value) {
      audioStream.value.pause();
      audioStream.value.src = '';
      audioStream.value = null;
    }
    
    // Update current station and track info first
    currentStationId.value = station.id;
    currentTrack.value = {
      title: station.name,
      artist: station.country,
      artwork: station.logo || placeholderImage,
      bitrate: station.bitrate,
      format: station.codec,
      streamUrl: station.streamUrl,
      mimeType: 'audio/mpeg'
    };

    // Create new Audio object with error handling
    audioStream.value = new Audio(station.streamUrl);
    audioStream.value.crossOrigin = 'anonymous';
    audioStream.value.volume = volume.value;
    
    // Add event listeners
    audioStream.value.addEventListener('playing', () => {
      isPlaying.value = true;
      updateListenerCount(1);
      error.value = null;
      isPlaybackLoading.value = false;
    });
    
    audioStream.value.addEventListener('pause', () => {
      isPlaying.value = false;
      updateListenerCount(-1);
    });
    
    audioStream.value.addEventListener('ended', () => {
      isPlaying.value = false;
      error.value = 'Stream ended. Click play to retry.';
    });
    
    audioStream.value.addEventListener('error', (e) => {
      console.error('Audio stream error:', e);
      error.value = `Stream error: ${getAudioErrorMessage(e)}`;
      isPlaying.value = false;
      isPlaybackLoading.value = false;
    });

    // Start playing
    try {
      await audioStream.value.play();
      
      // Scroll to player section smoothly
      playerSection.value?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Log station click only if playback starts successfully
      await fetch(`https://de1.api.radio-browser.info/json/url/${station.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (playError) {
      console.error('Playback failed:', playError);
      error.value = 'Failed to play this station. Please try another one.';
      isPlaybackLoading.value = false;
      throw playError;
    }

  } catch (error) {
    console.error('Error playing station:', error);
    error.value = 'Failed to play this station. Please try another one.';
    isPlaybackLoading.value = false;
  }
};

const updateListenerCount = (change) => {
  totalListeners.value = Math.max(0, totalListeners.value + change);
};

const handlePlayPause = async () => {
  if (!currentStationId.value) {
    error.value = 'Please select a station first';
    return;
  }

  try {
    if (audioStream.value) {
      if (audioStream.value.paused) {
        error.value = null;
        await audioStream.value.play();
      } else {
        audioStream.value.pause();
      }
    } else {
      error.value = 'No audio stream available. Please select a station first';
    }
  } catch (error) {
    console.error('Play/Pause failed:', error);
    error.value = 'Failed to control playback. Please try again.';
  }
};

const toggleMute = () => {
  if (audioStream.value) {
    if (isMuted.value) {
      volume.value = previousVolume.value;
      isMuted.value = false;
    } else {
      previousVolume.value = volume.value;
      volume.value = 0;
      isMuted.value = true;
    }
    audioStream.value.volume = volume.value;
  }
};

const updateVolume = () => {
  if (audioStream.value) {
    audioStream.value.volume = volume.value;
    isMuted.value = volume.value === 0;
  }
};

const getAudioErrorMessage = (error) => {
  if (!error || !error.target || !error.target.error) {
    return 'Unknown error';
  }
  
  switch (error.target.error.code) {
    case 1:
      return 'Stream loading aborted';
    case 2:
      return 'Network error occurred';
    case 3:
      return 'Audio decoding failed';
    case 4:
      return 'Stream source not supported';
    default:
      return 'Unknown playback error';
  }
};

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