import { useState, useCallback, useEffect, useRef } from 'react'
//import { BarChart2, Users, MessageSquare, Settings } from 'lucide-react'
import type { CarouselApi } from '@components/ui/carousel'
import menubar from '../../assets/menubar-1.mp4'

import { Carousel, CarouselContent, CarouselItem } from '@components/ui/carousel'
import { Button } from '@components/ui/button'

// Define the features to display in the carousel
const features = [
  {
    description: 'Find the app in your menu bar – ready whenever you need it',
    image: menubar
  },
  {
    description: 'Logs, templates and config are located in your documents folder',
    image: menubar
  },
  {
    description: 'Add and edit metadata from your footage effortlessly.',
    image: menubar
  },
  {
    description: ' Build custom templates using React right in the code editor.',
    image: menubar
  },
  {
    description: ' Create presets to simplify and speed up repetitive tasks.',
    image: menubar
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
    // Handle the "Get Started" action here
    console.log('Getting started!')
    // You could redirect to another page or trigger another action
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
              <div className="flex flex-col items-center p-1">
                <div className="overflow-hidden rounded-lg">
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={feature.image}
                    autoPlay
                    muted
                    playsInline
                    width={540}
                    height={380}
                    className="h-[220px] w-full object-cover"
                    onEnded={(e) => {
                      e.currentTarget.pause()
                      e.currentTarget.currentTime = e.currentTarget.duration
                    }}
                  />
                </div>
                <div className="mt-6 mb-8 flex flex-col items-center text-center">
                  <p className="max-w-md text-foreground">{feature.description}</p>
                </div>
              </div>
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
