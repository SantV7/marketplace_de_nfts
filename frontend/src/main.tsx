import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './styles/global.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, 
      refetchOnWindowFocus: false,
    },
  },
})

async function prepareApp() {
  if (import.meta.env.VITE_ENABLE_MOCKS === 'true' || import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ serviceWorker: { url: '/mockServiceWorker.js?v=2.15.0' } })
  }
  const { RealtimeSync } = await import('./services/RealtimeSync')
  createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <RealtimeSync />
      <App />
    </QueryClientProvider>,
  )
}

prepareApp()
