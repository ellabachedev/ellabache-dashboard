import { useContext } from 'react'
import { ThemeContext } from '../theme/themeContext.js'

// Returns { theme: 'light' | 'dark', toggleTheme }.
export function useTheme() {
  return useContext(ThemeContext)
}
