import { ref, reactive, provide, inject, type InjectionKey } from 'vue'

interface Track {
  title: string
  artist: string
  artwork: string
  bitrate: string
  format: string
  streamUrl: string
  mimeType: string
  category: string
}

interface AudioState {
  currentTrack: Track
  isPlaying: boolean
  volume: number
  isMuted: boolean
  audioStream: HTMLAudioElement | null
}

interface AudioActions {
  handlePlayPause: () => Promise<void>
  updateVolume: (value: number) => void
  toggleMute: () => void
  setTrack: (track: Track) => void
  initializeAudio: (url: string) => Promise<boolean>
  stopAudio: () => void
}

const AudioKey: InjectionKey<{
  state: AudioState
  actions: AudioActions
}> = Symbol('AudioState')

const DEFAULT_ARTWORK = 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400&h=400&fit=crop'

export function createAudioState() {
  const state = reactive<AudioState>({
    currentTrack: {
      title: 'Welcome to TuneRadio',
      artist: 'Select a station to start listening',
      artwork: DEFAULT_ARTWORK,
      bitrate: '128',
      format: 'MP3',
      streamUrl: '',
      mimeType: 'audio/mpeg',
      category: 'Featured Stations'
    },
    isPlaying: false,
    volume: 1,
    isMuted: false,
    audioStream: null
  })

  const previousVolume = ref(1)
  let loadTimeout: ReturnType<typeof setTimeout> | null = null

  const actions: AudioActions = {
    async handlePlayPause() {
      try {
        if (!state.audioStream && state.currentTrack.streamUrl) {
          await actions.initializeAudio(state.currentTrack.streamUrl)
          return
        }

        if (state.audioStream) {
          if (state.audioStream.paused) {
            await state.audioStream.play()
            state.isPlaying = true
          } else {
            state.audioStream.pause()
            state.isPlaying = false
          }
        }
      } catch (error) {
        console.error('Playback error:', error)
        state.isPlaying = false
        throw error
      }
    },

    updateVolume(value = 1) {
      state.volume = value
      if (state.audioStream) {
        state.audioStream.volume = value
        state.isMuted = value === 0
      }
    },

    toggleMute() {
      if (state.audioStream) {
        if (state.isMuted) {
          state.volume = previousVolume.value
          state.isMuted = false
        } else {
          previousVolume.value = state.volume
          state.volume = 0
          state.isMuted = true
        }
        state.audioStream.volume = state.volume
      }
    },

    setTrack(track: Track) {
      state.currentTrack = track
      actions.stopAudio()
    },

    async initializeAudio(streamUrl: string): Promise<boolean> {
      try {
        // Create new audio element if it doesn't exist
        if (!state.audioStream) {
          state.audioStream = new Audio()
        }

        // Reset audio element
        state.audioStream.src = ''
        state.audioStream.load()

        // Set new source
        state.audioStream.src = streamUrl

        // Set volume and other properties
        state.audioStream.volume = state.volume
        state.audioStream.crossOrigin = 'anonymous'

        // Return promise that resolves when audio can play
        return new Promise((resolve) => {
          const timeoutId = setTimeout(() => {
            resolve(false)
          }, 5000) // 5 second timeout

          state.audioStream!.addEventListener('canplay', () => {
            clearTimeout(timeoutId)
            state.audioStream!.play()
              .then(() => {
                state.isPlaying = true
                resolve(true)
              })
              .catch(() => resolve(false))
          }, { once: true })

          state.audioStream!.addEventListener('error', () => {
            clearTimeout(timeoutId)
            resolve(false)
          }, { once: true })

          // Start loading the audio
          state.audioStream!.load()
        })
      } catch (err) {
        console.error('Error initializing audio:', err)
        state.isPlaying = false
        return false
      }
    },

    stopAudio() {
      if (loadTimeout) {
        clearTimeout(loadTimeout)
        loadTimeout = null
      }
      
      if (state.audioStream) {
        state.audioStream.pause()
        state.audioStream.src = ''
        state.audioStream.remove()
        state.audioStream = null
        state.isPlaying = false
      }
    }
  }

  // Clean up on window unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      actions.stopAudio()
    })
  }

  provide(AudioKey, { state, actions })
  return { state, actions }
}

export function useAudioState() {
  const audio = inject(AudioKey)
  if (!audio) throw new Error('Audio state not provided')
  return audio
} 