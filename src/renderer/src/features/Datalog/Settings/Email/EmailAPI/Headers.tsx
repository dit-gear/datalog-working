import { useFieldArray } from 'react-hook-form'
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'

interface HeaderProps {
  control: any
}
const Headers = ({ control }: HeaderProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'headers'
  })
  return (
    <div className="flex flex-col gap-4">
      <Label>Headers</Label>
      <div className="flex gap-10 items-end" key={'base'}>
        <Input type="text" value="content-type" disabled />

        <Input type="text" value="application/json" disabled />
        <Button type="button" variant="destructive" disabled>
          Remove
        </Button>
      </div>
      {fields.map((item, index) => (
        <div className="flex gap-10 items-start" key={item.id}>
          <FormField
            key={`${item.id}.header`}
            control={control}
            name={`headers.${index}.header`}
            render={({ field }) => (
              <FormItem>
                <FormLabel hidden>Header</FormLabel>
                <FormControl>
                  <Input type="text" {...field} placeholder="header key" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            key={`${item.id}.value`}
            control={control}
            name={`headers.${index}.value`}
            render={({ field }) => (
              <FormItem>
                <FormLabel hidden>Value</FormLabel>
                <FormControl>
                  <Input type="text" {...field} placeholder="value" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="button" variant="destructive" onClick={() => remove(index)}>
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" onClick={() => append({ header: '', value: '' })}>
        Add Header
      </Button>
    </div>
  )
}

export default Headers
