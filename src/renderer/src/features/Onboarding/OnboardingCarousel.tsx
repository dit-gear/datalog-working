import { useState, useCallback, useEffect, useRef } from 'react'
import { Clapperboard, Send, Code, Folder, Rocket } from 'lucide-react'
import type { CarouselApi } from '@components/ui/carousel'
import menubarImage from '../../assets/onboard/menubar.png'
import menubarVideo from '../../assets/onboard/statusbar.mov'
import filesImage from '../../assets/onboard/files.png'
import filesVid from '../../assets/onboard/folders.mov'
import editorImage from '../../assets/onboard/editor.png'
import presetsImage from '../../assets/onboard/presets.png'

import { Carousel, CarouselContent, CarouselItem } from '@components/ui/carousel'
import { Button } from '@components/ui/button'

// Define the features to display in the carousel
const features = [
  {},
  {
    description: 'Find the app in your menu bar – ready whenever you need it',
    image: menubarImage,
    vid: menubarVideo,
    icon: <Rocket className="h-5 w-5 text-foreground" />
  },
  {
    description: 'Project files and configs are located in your documents folder',
    image: filesImage,
    vid: filesVid,
    icon: <Folder className="h-5 w-5 text-foreground" />
  },
  {
    description: 'Add and edit metadata from your footage effortlessly.',
    image: menubarImage,
    icon: <Clapperboard className="h-5 w-5 text-foreground" />
  },
  {
    description: ' Build custom templates using React right in the code editor.',
    image: editorImage,
    icon: <Code className="h-5 w-5 text-foreground" />
  },
  {
    description: ' Create presets to simplify and speed up repetitive tasks.',
    image: presetsImage,
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

  const handleGetStarted = useCallback(() => {
    window.mainApi.finishOnboarding()
  }, [])

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
                <div className="mb-6 text-center">
                  <h1 className="mb-4 text-3xl font-extrabold tracking-normal text-center text-foreground">
                    Get Started
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
          onClick={isLastSlide ? handleGetStarted : handleNext}
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
