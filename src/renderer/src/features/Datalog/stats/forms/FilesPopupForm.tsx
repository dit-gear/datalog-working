import { useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { FormControl, FormField, FormItem, FormLabel, Form } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { SubmitHandler, useForm } from 'react-hook-form'
import { FilesType } from '@shared/datalogTypes'
import { Button } from '@components/ui/button'

interface FilesPopupFormProps {
  value: FilesType
  defaults: FilesType
  update: (data: FilesType) => void
  clear: () => void
  children: React.ReactNode
  header: string
}

export const FilesPopupForm: React.FC<FilesPopupFormProps> = ({
  value,
  defaults,
  update,
  clear,
  children,
  header
}) => {
  const BYTES_IN_GB = 1e9
  const form = useForm({
    defaultValues: {
      Files: value.Files,
      Size: Math.round(value.Size / BYTES_IN_GB)
    }
  })
  const {
    handleSubmit,
    reset,
    formState: { isDirty }
  } = form

  useEffect(() => {
    reset({ Files: value.Files, Size: Math.round(value.Size / BYTES_IN_GB) })
  }, [value])

  const onSubmit: SubmitHandler<FilesType> = (data): void => {
    let { Size, ...rest } = data
    Size = Size * BYTES_IN_GB // Convert from GB to Bytes
    const updated = { ...rest, Size }
    update(updated) // in Bytes
    reset(data) // in GB
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
              <h4 className="font-medium leading-none">{header}</h4>
              <p className="text-sm text-muted-foreground">Set the number of clips and size.</p>
            </div>
            <div className="grid gap-2">
              <FormField
                name="Files"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-center gap-4">
                    <FormLabel>Clips</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        onBlur={field.onBlur}
                        className="col-span-2 h-8"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="Size"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-center gap-4">
                    <FormLabel>Size in GB</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        onBlur={field.onBlur}
                        className="col-span-2 h-8"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Button
              size="sm"
              onClick={() => {
                reset({ Files: defaults.Files, Size: Math.round(defaults.Size / BYTES_IN_GB) })
                clear()
              }}
            >
              Reset
            </Button>
          </div>
        </Form>
      </PopoverContent>
    </Popover>
  )
}
