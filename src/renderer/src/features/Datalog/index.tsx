import '../../assets/main.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppRouter from './Router'
import ErrorBoundary from '../../utils/ErrorBoundary'

const params = new URLSearchParams(window.location.search)
const defaultRoute = params.get('defaultRoute')

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div style={{ height: '36px', WebkitAppRegion: 'drag' } as React.CSSProperties}></div>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppRouter defaultRoute={defaultRoute} />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
