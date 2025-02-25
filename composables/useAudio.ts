import { ref, onBeforeUnmount } from 'vue'
import { useAudioStore } from '~/stores/audio'
import { storeToRefs } from 'pinia'

interface AudioState {
  audioStream: HTMLAudioElement | null;
  error: string | null;
  isLoading: boolean;
}

export function useAudio() {
  const audioStore = useAudioStore()
  const { currentTrack, isPlaying, volume, isMuted } = storeToRefs(audioStore)
  const { updateVolume, handlePlayPause, toggleMute } = audioStore

  const state = ref<AudioState>({
    audioStream: null,
    error: null,
    isLoading: false
  })

  const initializeAudioStream = (streamUrl: string): HTMLAudioElement => {
    if (state.value.audioStream) {
      state.value.audioStream.pause()
      state.value.audioStream.src = ''
      state.value.audioStream = null
    }

    const audio = new Audio(streamUrl)
    audio.crossOrigin = 'anonymous'
    audio.volume = volume.value
    state.value.audioStream = audio
    audioStore.audioStream = audio

    return audio
  }

  onBeforeUnmount(() => {
    if (state.value.audioStream) {
      state.value.audioStream.pause()
      state.value.audioStream.src = ''
      state.value.audioStream = null
    }
  })

  return {
    ...state.value,
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    updateVolume,
    handlePlayPause,
    toggleMute,
    initializeAudioStream
  }
} 