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
  initializeAudio: (url: string) => Promise<void>
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

    async initializeAudio(url: string) {
      try {
        // Clear any existing timeout and audio
        if (loadTimeout) clearTimeout(loadTimeout)
        actions.stopAudio()

        // Create new audio instance with optimized settings
        const audio = new Audio()
        audio.crossOrigin = 'anonymous'
        audio.volume = state.volume
        audio.preload = 'auto'
        
        // Reduce buffering to start playback faster
        audio.autobuffer = true
        audio.autoplay = true // Try immediate autoplay
        
        const playPromise = new Promise((resolve, reject) => {
          // Shorter timeout (3 seconds)
          loadTimeout = setTimeout(() => {
            reject(new Error('Stream loading timeout'))
          }, 3000)

          const cleanup = () => {
            if (loadTimeout) {
              clearTimeout(loadTimeout)
              loadTimeout = null
            }
          }

          // Try to play as soon as we have enough data
          audio.addEventListener('canplay', async () => {
            try {
              cleanup()
              await audio.play()
              state.isPlaying = true
              resolve(true)
            } catch (err) {
              cleanup()
              reject(err)
            }
          }, { once: true })

          audio.addEventListener('error', (e) => {
            cleanup()
            state.isPlaying = false
            reject(new Error('Failed to play audio'))
          }, { once: true })
        })

        // Set source and immediately try to load
        audio.src = url
        state.audioStream = audio
        audio.load() // Force immediate loading

        // Wait for either play success or failure
        await playPromise
      } catch (error) {
        console.error('Error initializing audio:', error)
        state.isPlaying = false
        throw error
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