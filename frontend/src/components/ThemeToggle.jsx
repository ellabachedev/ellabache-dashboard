import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme.js'
import Button from './Button.jsx'

// Icon button that switches between light and dark mode.
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'
  return (
    <Button
      icon
      onClick={toggleTheme}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
    </Button>
  )
}
