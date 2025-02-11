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
    <div style={{ height: '36px', WebkitAppRegion: 'drag' } as React.CSSProperties}></div>
    <ErrorBoundary>
      <div
        className="flex flex-row gap-2"
        style={{
          height: 'calc(100vh - 36px)'
        }}
      >
        <DataProvider>
          <SidebarProvider className="min-h-[calc(100vh-36px)]">
            <Aside />
            <EditorWrapper />
          </SidebarProvider>
        </DataProvider>
      </div>
    </ErrorBoundary>
  </React.StrictMode>
)
