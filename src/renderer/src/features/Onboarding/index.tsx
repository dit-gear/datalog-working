import '../../assets/main.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { OnboardingCarousel } from './OnboardingCarousel'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div
      className="text-gray-100 h-[80px] p-6 flex flex-col"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="w-full rounded-lg bg-card p-4 shadow-md">
        <div className="mb-3 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Get started</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Let's walk you through the key features to get you started
          </p>
        </div>

        <OnboardingCarousel />
      </div>
    </div>
  </React.StrictMode>
)
