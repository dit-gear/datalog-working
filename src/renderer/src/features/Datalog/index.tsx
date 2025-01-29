import '../../assets/main.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './Router'
import ErrorBoundary from '../../utils/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div style={{ height: '36px', WebkitAppRegion: 'drag' } as React.CSSProperties}></div>
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  </React.StrictMode>
)
