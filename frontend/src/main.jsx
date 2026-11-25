import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// Inter variable font with optical sizes: large text automatically uses the tighter "display"
// letter shapes, small text the more open ones. Bundled with the app (no request to Google Fonts).
import '@fontsource-variable/inter/opsz.css'
import './index.css'
import ThemeProvider from './theme/ThemeProvider.jsx'

// TanStack Query fetches data, caches it in the browser and retries failed requests.
// staleTime: how long a result counts as fresh before it is fetched again in the background.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
