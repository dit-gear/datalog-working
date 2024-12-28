import '../../assets/main.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { DataProvider } from './dataContext'
import Aside from './sidebar/aside'
import EditorWrapper from './editorWrapper'
import { SidebarProvider } from '@components/ui/sidebar'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div style={{ height: '36px', WebkitAppRegion: 'drag' } as React.CSSProperties}></div>
    <div className="h-full flex flex-row gap-2">
      <DataProvider>
        <SidebarProvider>
          <Aside />
          <EditorWrapper />
        </SidebarProvider>
      </DataProvider>
    </div>
  </React.StrictMode>
)
