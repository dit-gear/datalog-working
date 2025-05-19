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
      <div className="w-full bg-card px-4">
        <OnboardingCarousel />
      </div>
    </div>
  </React.StrictMode>
)
