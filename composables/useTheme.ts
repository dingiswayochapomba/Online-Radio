import { ref } from 'vue'
import { useState as useNuxtState } from '#app'

export const useTheme = () => {
  const theme = useNuxtState<'dark' | 'light'>('theme', () => 'dark')

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return {
    theme,
    toggleTheme
  }
} 