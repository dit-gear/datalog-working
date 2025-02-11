import '../../assets/main.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppRouter from './Router'
import ErrorBoundary from '../../utils/ErrorBoundary'

const url = new URL(window.location.href)

// Extract the defaultRoute parameter.
const defaultRoute = url.searchParams.get('defaultRoute')

if (defaultRoute !== null) {
  // Remove defaultRoute from the query parameters.
  url.searchParams.delete('defaultRoute')

  // Update the browser URL to remove the parameter.
  window.history.replaceState({}, '', url.toString())

  if (!window.location.hash || window.location.hash === '#/') {
    // Prepend '#' if not already present.
    const newHash = defaultRoute.startsWith('#') ? defaultRoute : '#' + defaultRoute
    console.log('Updating hash to:', newHash)
    window.location.hash = newHash
  }
}

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div
      className="flex-none"
      style={{ height: '36px', WebkitAppRegion: 'drag' } as React.CSSProperties}
    ></div>
    <div
      style={{
        height: 'calc(100vh - 36px)',
        overflowY: 'auto'
      }}
    >
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppRouter />
        </QueryClientProvider>
      </ErrorBoundary>
    </div>
  </React.StrictMode>
)
