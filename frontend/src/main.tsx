import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './styles/global.css'
import App from './App.tsx'
import { preloadInitialRoute } from './routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, 
      refetchOnWindowFocus: false,
    },
  },
})

async function prepareApp() {
  const routeReady = preloadInitialRoute()
  if (import.meta.env.VITE_ENABLE_MOCKS === 'true' || import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ quiet: true, onUnhandledRequest: 'bypass', serviceWorker: { url: '/mockServiceWorker.js?v=2.15.0' } })
  }
  const [{ RealtimeSync }] = await Promise.all([import('./services/RealtimeSync'), routeReady])
  createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <RealtimeSync />
      <App />
    </QueryClientProvider>,
  )
}

prepareApp()
