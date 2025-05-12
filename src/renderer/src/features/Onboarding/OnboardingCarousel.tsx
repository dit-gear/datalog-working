import { useState, useCallback, useEffect } from 'react'
import { Clapperboard, Send, Code, Folder, Rocket } from 'lucide-react'
import type { CarouselApi } from '@components/ui/carousel'
import menubarImage from '../../assets/onboard/menubar.png'
import filesImage from '../../assets/onboard/files.png'
import editorImage from '../../assets/onboard/editor.png'
import presetsImage from '../../assets/onboard/presets.png'

import { Carousel, CarouselContent, CarouselItem } from '@components/ui/carousel'
import { Button } from '@components/ui/button'

// Define the features to display in the carousel
const features = [
  {
    description: 'Find the app in your menu bar – ready whenever you need it',
    image: menubarImage,
    icon: Rocket
  },
  {
    description: 'Logs, templates and config are located in your documents folder',
    image: filesImage,
    icon: Folder
  },
  {
    description: 'Add and edit metadata from your footage effortlessly.',
    image: menubarImage,
    icon: Clapperboard
  },
  {
    description: ' Build custom templates using React right in the code editor.',
    image: editorImage,
    icon: Code
  },
  {
    description: ' Create presets to simplify and speed up repetitive tasks.',
    image: presetsImage,
    icon: Send
  }
]

export function OnboardingCarousel() {
  const [api, setApi] = useState<CarouselApi>()
  const [currentSlide, setCurrentSlide] = useState(0)
  const isLastSlide = currentSlide === features.length - 1

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
                  <img src={feature.image} className=" size-64 w-full object-cover" />
                </div>
                <div className="mt-4 flex flex-col items-center text-center">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <feature.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <p className="mt-2 max-w-md text-foreground">{feature.description}</p>
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
