import { useEffect, useState } from 'react'
import { THEME_STORAGE_KEY, ThemeContext } from './themeContext.js'

// index.html already set data-theme before React started; start from that value.
function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

// Holds the light/dark choice, writes it to <html data-theme> and remembers it in this browser.
export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(currentTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Private windows can block storage; the theme still works for this visit.
    }
  }, [theme])

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
