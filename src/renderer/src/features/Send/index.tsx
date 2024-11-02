import '../../assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import SendInitializer from './sendInitializer'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div style={{ height: '36px', WebkitAppRegion: 'drag' } as React.CSSProperties}></div>
    <SendInitializer />
  </React.StrictMode>
)
