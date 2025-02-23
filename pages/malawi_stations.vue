i<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Now Playing Section -->
    <div class="container mx-auto mt-8 p-4">
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
              {{ isPlaying ? 'Live' : 'Ready' }}
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
          Malawi Radio Stations
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
                {{ station.frequency }} • {{ station.location }}
              </p>
              <p class="text-xs text-gray-500">
                {{ station.genre }}
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
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useTheme } from '~/composables/useTheme';
import { useHead } from '@unhead/vue';

// Add page metadata
useHead({
  title: 'Malawi Radio Stations - TuneRadio',
  meta: [
    {
      name: 'description',
      content: 'Listen to live radio stations from Malawi'
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

// Base64 placeholder image
const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const currentTrack = ref({
  title: 'Welcome to TuneRadio',
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
    
    const malawiStations = [
      {
        id: 'mbc-radio-1',
        name: 'MBC Radio 1',
        frequency: 'FM 92.3',
        genre: 'News, Talk, Information',
        location: 'Blantyre',
        logo: 'https://raw.githubusercontent.com/brnkgabriel/radio-stations-assets/main/malawi/mbc-radio-1.png',
        streamUrl: 'https://ice31.securenetsystems.net/MBCR1',
        listeners: 1500,
        bitrate: 128,
        codec: 'MP3'
      },
      {
        id: 'zodiak-radio',
        name: 'Zodiak Radio',
        frequency: 'FM 95.1',
        genre: 'News, Talk, Information',
        location: 'Lilongwe',
        logo: 'https://raw.githubusercontent.com/brnkgabriel/radio-stations-assets/main/malawi/zodiak.png',
        streamUrl: 'http://stream.zeno.fm/m2qef6dkny8uv',
        listeners: 1200,
        bitrate: 128,
        codec: 'MP3'
      },
      {
        id: 'times-radio',
        name: 'Times Radio',
        frequency: 'FM 92.8',
        genre: 'News, Talk, Information',
        location: 'Blantyre',
        logo: 'https://raw.githubusercontent.com/brnkgabriel/radio-stations-assets/main/malawi/times-radio.png',
        streamUrl: 'https://ice31.securenetsystems.net/TIMESFM',
        listeners: 700,
        bitrate: 128,
        codec: 'MP3'
      },
      {
        id: 'radio-maria-malawi',
        name: 'Radio Maria Malawi',
        frequency: 'FM 99.2',
        genre: 'Religious, Christian',
        location: 'Mangochi',
        logo: 'https://raw.githubusercontent.com/brnkgabriel/radio-stations-assets/main/malawi/radio-maria.png',
        streamUrl: 'http://dreamsiteradiocp.com:8034/stream',
        listeners: 600,
        bitrate: 128,
        codec: 'MP3'
      }
    ];

    // Map stations to our format
    stations.value = malawiStations.map(station => ({
      id: station.id,
      name: station.name,
      genre: station.genre,
      logo: station.logo,
      listeners: station.listeners,
      bitrate: station.bitrate,
      streamUrl: station.streamUrl,
      codec: station.codec,
      country: 'Malawi',
      location: station.location,
      frequency: station.frequency || 'Web',
      lastChecked: new Date().toLocaleDateString(),
      status: 'Online'
    }));

    totalListeners.value = stations.value.length;

  } catch (error) {
    console.error('Error loading stations:', error);
    error.value = 'Failed to load Malawi radio stations';
  } finally {
    isLoading.value = false;
  }
};

const selectStation = async (station) => {
  try {
    isLoading.value = true;
    error.value = null;
    
    // Stop current stream if exists
    if (audioStream.value) {
      audioStream.value.pause();
      audioStream.value.src = '';
      audioStream.value = null;
    }
    
    currentStationId.value = station.id;
    currentTrack.value = {
      title: station.name,
      artist: `${station.location}, Malawi - ${station.frequency}`,
      artwork: station.logo,
      bitrate: station.bitrate,
      format: station.codec,
      streamUrl: station.streamUrl,
      mimeType: 'audio/mpeg'
    };

    // Create new Audio object with error handling
    audioStream.value = new Audio();
    audioStream.value.crossOrigin = 'anonymous';
    audioStream.value.volume = volume.value;
    
    // Add event listeners with better error handling
    audioStream.value.addEventListener('playing', () => {
      isPlaying.value = true;
      isLoading.value = false;
      error.value = null;
    });
    
    audioStream.value.addEventListener('waiting', () => {
      isLoading.value = true;
    });
    
    audioStream.value.addEventListener('error', (e) => {
      console.error('Stream error:', e);
      const errorMessage = getAudioErrorMessage(e);
      error.value = `Unable to connect to radio stream (${errorMessage}). Please try again or select another station.`;
      isLoading.value = false;
      isPlaying.value = false;
    });

    // Set source and load after adding event listeners
    audioStream.value.src = station.streamUrl;
    await audioStream.value.load();
    await audioStream.value.play();

  } catch (err) {
    console.error('Playback error:', err);
    error.value = 'Failed to play this station. Please try another one.';
    isPlaying.value = false;
  } finally {
    isLoading.value = false;
  }
};

const updateListenerCount = (change) => {
  totalListeners.value = Math.max(0, totalListeners.value + change);
};

const handleAudioError = (error) => {
  console.error('Audio playback error:', error);
  error.value = 'Stream playback error. Please try another station.';
  isPlaying.value = false;
};

const handlePlayPause = async () => {
  if (!currentStationId.value) {
    error.value = 'Please select a station first';
    return;
  }

  try {
    if (audioStream.value) {
      if (audioStream.value.paused) {
        error.value = null; // Clear any previous errors
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

const handleVolumeChange = () => {
  if (audioPlayer.value) {
    volume.value = audioPlayer.value.volume;
    isMuted.value = audioPlayer.value.muted;
  }
};

const getAudioErrorMessage = (error) => {
  if (!error || !error.target || !error.target.error) {
    return 'Unknown error';
  }
  
  switch (error.target.error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      return 'Playback aborted';
    case MediaError.MEDIA_ERR_NETWORK:
      return 'Network error';
    case MediaError.MEDIA_ERR_DECODE:
      return 'Audio decode failed';
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return 'Format not supported';
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
</style> 