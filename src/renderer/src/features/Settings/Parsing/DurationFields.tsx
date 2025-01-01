import { FormField, FormItem, FormControl, FormLabel, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@components/ui/select'
import { useFormContext, useWatch } from 'react-hook-form'
import { Info } from 'lucide-react'

interface DurationFieldsProps {
  scope: 'project' | 'global'
  index: number
}

const DurationFields: React.FC<DurationFieldsProps> = ({ scope, index }) => {
  const { control } = useFormContext()
  const unit = useWatch({
    control,
    name: `${scope}_custom_fields.fields.${index}.unit`
  })
  return (
    <>
      <div className="flex gap-10 py-4 pl-4 pr-5 text-sm leading-6">
        <FormField
          control={control}
          name={`${scope}_custom_fields.fields.${index}.unit`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration Unit</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ms">Milliseconds</SelectItem>
                    <SelectItem value="s">Seconds</SelectItem>
                    <SelectItem value="tc">{`TC (HH:MM:SS:FF)`}</SelectItem>
                    <SelectItem value="frames">Frames</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {unit === 'tc' || unit === 'frames' ? (
          <FormField
            control={control}
            name={`${scope}_custom_fields.fields.${index}.fps`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>CSV Column Name for FPS</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
      </div>
      <div className="rounded-md bg-blue-950 p-4 m-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info aria-hidden="true" className="h-5 w-5 text-blue-200" />
          </div>
          <div className="ml-3 flex-1 md:flex md:justify-between">
            <p className="text-sm text-blue-200">
              Duration will be stored in milliseconds. <br /> Specify the unit of your field for
              automatic conversion. If the duration is in timecode or frames, you must also specify
              a CSV column for frames per second.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default DurationFields
