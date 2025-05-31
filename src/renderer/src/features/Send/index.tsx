import '../../assets/main.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SendSelector from './sendSelector'
import ErrorBoundary from '@renderer/utils/ErrorBoundary'
import { OnlineStatusProvider } from '@renderer/utils/OnlineStatus'
import MessageBox from '@components/MessageBox'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div className="relative h-dvh">
      <div
        style={
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: '5px',
            height: '36px',
            zIndex: 10,
            WebkitAppRegion: 'drag'
          } as React.CSSProperties
        }
      ></div>
      <div className="h-dvh">
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <OnlineStatusProvider>
              <SendSelector />
              <MessageBox />
            </OnlineStatusProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </div>
    </div>
  </React.StrictMode>
)
