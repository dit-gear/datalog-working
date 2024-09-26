import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { FormControl, FormField, FormItem, FormLabel, Form } from '@components/ui/form'
import { Input } from '@components/ui/input'
import {
  formatDurationToString,
  formatDuration,
  formatDurationToMS
} from '@renderer/utils/format-duration'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { durationType } from '@shared/shared-types'

interface DurationPopupFormProps {
  value: number
  update: (data: number) => void
  cliptowatch: string
}

export const DurationPopupForm = ({ value, update, cliptowatch }: DurationPopupFormProps) => {
  const { hours, minutes, seconds } = formatDuration(value)

  const valueinsync = useWatch({ name: cliptowatch })

  const form = useForm<durationType>({
    defaultValues: {
      hours: hours,
      minutes: minutes,
      seconds: seconds
    }
  })
  const { handleSubmit, reset } = form

  const onSubmit: SubmitHandler<durationType> = (data): void => {
    const duration = formatDurationToMS(data.hours, data.minutes, data.seconds)
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
      <PopoverTrigger className="min-w-12 min-h-10 text-left">
        <span className="whitespace-nowrap">{formatDurationToString(valueinsync)}</span>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Form {...form}>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Duration</h4>
              <p className="text-sm text-muted-foreground">Set the duration for the clip.</p>
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
            </div>
          </div>
        </Form>
      </PopoverContent>
    </Popover>
  )
}
