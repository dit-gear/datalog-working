import '../../assets/main.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SendSelector from './sendSelector'
import ErrorBoundary from '@renderer/utils/ErrorBoundary'
import MessageBox from './MessageBox'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div style={{ height: '36px', WebkitAppRegion: 'drag' } as React.CSSProperties}></div>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SendSelector />
        <MessageBox />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
