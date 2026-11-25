import { createContext } from 'react'

// Shared "which theme is on" value. A context lets any component read it without passing props.
export const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} })

export const THEME_STORAGE_KEY = 'eb-theme'
