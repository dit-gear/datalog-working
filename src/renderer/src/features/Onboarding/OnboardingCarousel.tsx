import { useState, useCallback, useEffect, useRef } from 'react'
import { Clapperboard, Send, Code, Folder, Rocket } from 'lucide-react'
import type { CarouselApi } from '@components/ui/carousel'
import menubarVideo from '../../assets/onboard/menubar.mp4'
import foldersImage from '../../assets/onboard/folders.png'
import metadataVideo from '../../assets/onboard/metadata.mp4'
import editorImage from '../../assets/onboard/editor.png'
import presetsvideo from '../../assets/onboard/presets.mp4'

import { Carousel, CarouselContent, CarouselItem } from '@components/ui/carousel'
import { Button } from '@components/ui/button'

// Define the features to display in the carousel
const features = [
  {},
  {
    description: 'Find the app in your menu bar – ready whenever you need it!',
    vid: menubarVideo,
    icon: <Rocket className="h-5 w-5 text-foreground" />
  },
  {
    description: 'File based configuration - everything is located in your documents folder!',
    image: foldersImage,
    icon: <Folder className="h-5 w-5 text-foreground" />
  },
  {
    description: 'Ingest and edit metadata from your footage effortlessly!',
    vid: metadataVideo,
    icon: <Clapperboard className="h-5 w-5 text-foreground" />
  },
  {
    description: 'Create your own email and pdf templates using React!',
    image: editorImage,
    icon: <Code className="h-5 w-5 text-foreground" />
  },
  {
    description: 'Distribute your reports in seconds with presets!',
    vid: presetsvideo,
    icon: <Send className="h-5 w-5 text-foreground" />
  }
]

export function OnboardingCarousel() {
  const [api, setApi] = useState<CarouselApi>()
  const [currentSlide, setCurrentSlide] = useState(0)
  const isLastSlide = currentSlide === features.length - 1

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    videoRefs.current.forEach((video) => {
      if (!video) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            video.play()
          } else {
            video.pause()
          }
        },
        { threshold: 0.5 }
      )

      observer.observe(video)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer, i) => {
        if (videoRefs.current[i]) {
          observer.unobserve(videoRefs.current[i]!)
        }
      })
    }
  }, [])

  const handleNext = useCallback(() => {
    if (!api) return
    api.scrollNext()
  }, [api])

  useEffect(() => {
    if (!api) return
    const handleSelect = () => {
      setCurrentSlide(api.selectedScrollSnap())
    }
    api.on('select', handleSelect)
    return () => {
      api.off('select', handleSelect)
    }
  }, [api])

  return (
    <div className="relative mx-auto w-full max-w-[700px]">
      <Carousel
        opts={{
          loop: false
        }}
        className="w-full"
        setApi={setApi}
      >
        <CarouselContent>
          {features.map((feature, index) => (
            <CarouselItem key={index} data-carousel-item>
              {index === 0 ? (
                <div className="flex flex-col mb-6 items-center">
                  <svg
                    width="200"
                    height="200"
                    viewBox="0 0 200 200"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="100" cy="100" r="30" fill="#60a5fa">
                      <animate
                        attributeName="r"
                        values="30;40;30"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="fill"
                        values="#60a5fa;#2563eb;#60a5fa"
                        dur="8s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                  <h1 className="mb-4 text-3xl font-extrabold tracking-normal text-center text-foreground">
                    Get Started with daytalog
                  </h1>
                  <p className="mt-2 text-base text-muted-foreground text-center px-6">
                    Let's walk you through the key features to get you started
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center p-1">
                  <div className="overflow-hidden rounded-lg border">
                    {feature.vid ? (
                      <video
                        ref={(el) => {
                          videoRefs.current[index] = el
                        }}
                        src={feature.vid}
                        autoPlay
                        muted
                        playsInline
                        className="max-h-56 w-full object-cover mx-auto"
                        onEnded={(e) => {
                          e.currentTarget.pause()
                          e.currentTarget.currentTime = e.currentTarget.duration
                        }}
                      />
                    ) : (
                      <img src={feature.image} className="max-h-56 w-full object-cover mx-auto" />
                    )}
                  </div>
                  <div className="mt-4 flex flex-col items-center text-center">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {feature.icon}
                    </div>
                    <p className="mt-4 max-w-md text-foreground text-xl font-semibold leading-relaxed text-center px-4">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-5 flex flex-col items-center">
        <Button
          onClick={isLastSlide ? () => window.mainApi.finishOnboarding() : handleNext}
          className="mb-4"
          size="default"
        >
          {isLastSlide ? 'Create Your First Project' : 'Continue'}
        </Button>

        <div className="flex justify-center gap-2">
          {features.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full ${currentSlide === index ? 'bg-primary' : 'bg-muted'}`}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/*
   <video
                        ref={(el) => {
                          videoRefs.current[index] = el
                        }}
                        src={feature.vid}
                        autoPlay
                        muted
                        playsInline
                        //className="max-h-56 w-full object-cover mx-auto"
                        onEnded={(e) => {
                          e.currentTarget.pause()
                          e.currentTarget.currentTime = e.currentTarget.duration
                        }}
                      />
*/
