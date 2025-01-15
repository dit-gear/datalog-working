import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { FormControl, FormField, FormItem, FormLabel, Form, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { formatDurationToTC } from '@shared/utils/format-duration'
import { SubmitHandler, useForm } from 'react-hook-form'
import { durationType } from '@shared/shared-types'
import { Button } from '@components/ui/button'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'

interface DurationPopupFormProps {
  value: durationType | null
  update: (data: string) => void
  clear: () => void
  children: React.ReactNode
  sec?: boolean
}

const durationSchema = z.object({
  hours: z.coerce.number().nonnegative().max(99, `max 99 hours in TC format`),
  minutes: z.coerce.number().nonnegative().max(59, `max 59 minutes in TC format`),
  seconds: z.coerce.number().nonnegative().max(59, `max 59 seconds in TC format`)
})

export const DurationPopupForm: React.FC<DurationPopupFormProps> = ({
  value,
  update,
  clear,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const form = useForm<durationType>({
    defaultValues: {
      hours: value?.hours,
      minutes: value?.minutes,
      seconds: value?.seconds
    },
    mode: 'onSubmit',
    resolver: zodResolver(durationSchema)
  })
  const {
    handleSubmit,
    reset,
    formState: { isValid }
  } = form

  useEffect(() => {
    reset({
      hours: value?.hours ?? 0,
      minutes: value?.minutes ?? 0,
      seconds: value?.seconds ?? 0
    })
  }, [value])

  const onSubmit: SubmitHandler<durationType> = (data): void => {
    if (data !== value) {
      const duration = formatDurationToTC(data)
      update(duration)
    }
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={(v) => setIsOpen(v)}>
      <PopoverTrigger className="min-w-12 min-h-10 text-left rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Form {...form}>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Duration</h4>
              <p className="text-sm text-muted-foreground">Set the duration.</p>
            </div>
            <div className="flex gap-10 ">
              <FormField
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="text"
                          maxLength={2}
                          pattern="\d{2}"
                          {...field}
                          className="h-8"
                          placeholder="HH"
                          onKeyDown={(e) => {
                            const allowedKeys = [
                              'Backspace',
                              'ArrowLeft',
                              'ArrowRight',
                              'Delete',
                              'Tab'
                            ]
                            if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                              e.preventDefault()
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel>h</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="minutes"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="text"
                          maxLength={2}
                          pattern="\d{2}"
                          {...field}
                          className=" h-8"
                          placeholder="MM"
                          onKeyDown={(e) => {
                            const allowedKeys = [
                              'Backspace',
                              'ArrowLeft',
                              'ArrowRight',
                              'Delete',
                              'Tab'
                            ]
                            if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                              e.preventDefault()
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel>m</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="seconds"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="text"
                          maxLength={2}
                          pattern="\d{2}"
                          {...field}
                          className=" h-8"
                          placeholder="SS"
                          onKeyDown={(e) => {
                            const allowedKeys = [
                              'Backspace',
                              'ArrowLeft',
                              'ArrowRight',
                              'Delete',
                              'Tab'
                            ]
                            if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                              e.preventDefault()
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel>s</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button type="submit" size="sm" onClick={handleSubmit(onSubmit)} disabled={!isValid}>
                Set
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setIsOpen(false)
                  clear()
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </Form>
      </PopoverContent>
    </Popover>
  )
}
