import '../../assets/main.css'
import image from '../../assets/appIconlight.png'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Button } from '@components/ui/button'
import License from './License'
import Version from './Version'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div
      className=" text-gray-100 h-[500px] p-6 flex flex-col"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center justify-center">
        <img src={image} alt="Map App Icon" width={120} height={120} className="rounded-xl" />
      </div>

      <h1 className="text-2xl font-bold text-center mb-4">Datalog.email</h1>

      <div className="text-center mb-4">
        <Version />
        <p className="text-xs text-muted-foreground">© 2025 DIT Gear AB</p>
      </div>

      <Button
        variant="outline"
        className="mb-4"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        Check for Updates
      </Button>
      <License />
    </div>
  </React.StrictMode>
)
