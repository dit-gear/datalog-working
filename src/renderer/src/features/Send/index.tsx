import '../../assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { DataProvider } from './dataContext'
import SendSelector from './sendSelector'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div style={{ height: '36px', WebkitAppRegion: 'drag' } as React.CSSProperties}></div>
    <DataProvider>
      <SendSelector />
    </DataProvider>
  </React.StrictMode>
)
