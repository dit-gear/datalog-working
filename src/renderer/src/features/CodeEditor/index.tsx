import '../../assets/main.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { DataProvider } from './dataContext'
import Aside from './sidebar/aside'
import EditorWrapper from './editorWrapper'
import { SidebarProvider } from '@components/ui/sidebar'
import ErrorBoundary from '@renderer/utils/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div className="relative h-dvh">
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
      ></div>
      <ErrorBoundary>
        <div className="h-dvh">
          <DataProvider>
            <SidebarProvider>
              <Aside />
              <div className="h-dvh w-full">
                <EditorWrapper />
              </div>
            </SidebarProvider>
          </DataProvider>
        </div>
      </ErrorBoundary>
    </div>
  </React.StrictMode>
)
