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
    <div style={{ position: 'relative', height: '100vh' }}>
      {/* Draggable header */}
      <div
        style={
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: '5px', // leave room for the scrollbar
            height: '36px',
            WebkitAppRegion: 'drag',
            zIndex: 10
          } as React.CSSProperties
        }
      >
        {/* Header content if any */}
      </div>
      {/* Scrollable container that spans full height */}
      <div
        style={
          {
            height: '100%',
            overflowY: 'scroll',
            scrollbarGutter: 'stable'
            //paddingTop: '36px' // offset content so it doesn't hide behind header
          } as React.CSSProperties
        }
      >
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <AppRouter />
          </QueryClientProvider>
        </ErrorBoundary>
      </div>
    </div>
  </React.StrictMode>
)
