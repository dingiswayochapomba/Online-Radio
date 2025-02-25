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

  const actions: AudioActions = {
    async handlePlayPause() {
      try {
        if (!state.audioStream && state.currentTrack.streamUrl) {
          // If no audio stream exists but we have a URL, create new stream
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
      }
    },

    updateVolume(value: number) {
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
      // Stop current audio when changing tracks
      actions.stopAudio()
    },

    async initializeAudio(url: string) {
      try {
        // Stop any existing audio
        actions.stopAudio()

        // Create new audio instance
        const audio = new Audio()
        audio.crossOrigin = 'anonymous'
        audio.volume = state.volume
        
        // Set up event listeners
        audio.addEventListener('playing', () => {
          state.isPlaying = true
        })
        
        audio.addEventListener('pause', () => {
          state.isPlaying = false
        })
        
        audio.addEventListener('ended', () => {
          state.isPlaying = false
        })

        audio.addEventListener('error', (e) => {
          console.error('Audio error:', e)
          state.isPlaying = false
          throw new Error('Failed to play audio')
        })

        // Set source and load audio
        audio.src = url
        await audio.load()
        
        // Store the audio stream
        state.audioStream = audio
        
        // Try to play
        await audio.play()
      } catch (error) {
        console.error('Error initializing audio:', error)
        state.isPlaying = false
        throw error
      }
    },

    stopAudio() {
      if (state.audioStream) {
        state.audioStream.pause()
        state.audioStream.src = ''
        state.audioStream.remove()
        state.audioStream = null
        state.isPlaying = false
      }
    }
  }

  provide(AudioKey, { state, actions })
  return { state, actions }
}

export function useAudioState() {
  const audio = inject(AudioKey)
  if (!audio) throw new Error('Audio state not provided')
  return audio
} 