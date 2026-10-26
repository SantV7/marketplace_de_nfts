import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './styles/global.css'
import App from './App.tsx'
import { RealtimeSync } from './services/RealtimeSync'

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
    await worker.start()
  }
}

prepareApp().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RealtimeSync />
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
})
