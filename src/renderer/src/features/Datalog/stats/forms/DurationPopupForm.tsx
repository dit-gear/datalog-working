import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { FormControl, FormField, FormItem, FormLabel, Form } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { formatDuration, formatDurationToMS } from '@renderer/utils/format-duration'
import { SubmitHandler, useForm } from 'react-hook-form'
import { durationType } from '@shared/shared-types'
import { Button } from '@components/ui/button'

interface DurationPopupFormProps {
  value: number
  defaults?: number
  update: (data: number) => void
  clear?: () => void
  children: React.ReactNode
  sec?: boolean
}

export const DurationPopupForm: React.FC<DurationPopupFormProps> = ({
  value,
  defaults,
  update,
  clear,
  children,
  sec = false
}) => {
  const { hours, minutes, seconds } = formatDuration(value)

  const form = useForm<durationType>({
    defaultValues: {
      hours: hours,
      minutes: minutes,
      ...(sec && { seconds: seconds })
    }
  })
  const { handleSubmit, reset } = form

  const onSubmit: SubmitHandler<durationType> = (data): void => {
    const duration = formatDurationToMS(data.hours, data.minutes, sec ? data.seconds : 0)
    if (duration === defaults) return
    update(duration)
    reset(data)
  }

  const handleOpenChange = (open: boolean) => {
    if (open === false) {
      handleSubmit(onSubmit)()
    }
  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger className="min-w-12 min-h-10 text-left">{children}</PopoverTrigger>
      <PopoverContent className="w-80">
        <Form {...form}>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Duration</h4>
              <p className="text-sm text-muted-foreground">Set the duration.</p>
            </div>
            <div className="grid gap-2">
              <FormField
                name="hours"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-center gap-4">
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} className="col-span-2 h-8" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="minutes"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-center gap-4">
                    <FormLabel>Minutes</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} className="col-span-2 h-8" />
                    </FormControl>
                  </FormItem>
                )}
              />
              {sec && (
                <FormField
                  name="seconds"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-3 items-center gap-4">
                      <FormLabel>Seconds</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} className="col-span-2 h-8" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
            {clear && defaults && (
              <Button
                size="sm"
                onClick={() => {
                  const { hours, minutes, seconds } = formatDuration(defaults)
                  reset({ hours: hours, minutes: minutes, ...(sec && { seconds: seconds }) })
                  clear?.()
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </Form>
      </PopoverContent>
    </Popover>
  )
}