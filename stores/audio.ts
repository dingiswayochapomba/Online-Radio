import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAudioStore = defineStore('audio', () => {
  // State
  const currentTrack = ref({
    title: 'Welcome to TuneRadio',
    artist: 'Select a station to start listening',
    artwork: 'placeholder-image-url',
    bitrate: '128',
    format: 'MP3',
    streamUrl: '',
    mimeType: 'audio/mpeg',
    category: 'Featured Stations'
  })
  
  const isPlaying = ref(false)
  const volume = ref(1)
  const isMuted = ref(false)
  const audioStream = ref(null)
  const previousVolume = ref(1)

  // Actions
  function handlePlayPause() {
    if (audioStream.value) {
      if (audioStream.value.paused) {
        audioStream.value.play()
        isPlaying.value = true
      } else {
        audioStream.value.pause()
        isPlaying.value = false
      }
    }
  }

  function updateVolume(value: number) {
    volume.value = value
    if (audioStream.value) {
      audioStream.value.volume = value
      isMuted.value = value === 0
    }
  }

  function toggleMute() {
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

  return {
    // State
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    audioStream,
    previousVolume,
    // Actions
    handlePlayPause,
    updateVolume,
    toggleMute
  }
}) 