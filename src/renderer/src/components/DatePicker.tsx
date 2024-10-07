import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { Calendar } from '@components/ui/calendar'
import { Button } from './ui/button'
import { format, parse } from 'date-fns'

const DatePicker = ({ field }) => {
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false)
  return (
    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
      <PopoverTrigger asChild>
        <Button id="date" variant={'outline'}>
          {field.value ? field.value : <p>Pick a date</p>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={parse(field.value, 'yyyy-MM-dd', new Date())}
          onSelect={(date) => {
            if (date) {
              const formattedDate = format(date, 'yyyy-MM-dd')
              field.onChange(formattedDate)
            }
            setCalendarOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker
