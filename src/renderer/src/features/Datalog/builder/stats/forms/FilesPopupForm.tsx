import { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { FormControl, FormField, FormItem, FormLabel, Form, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { SubmitHandler, useForm } from 'react-hook-form'
import { OcfClipBaseType } from '@shared/datalogTypes'
import { Button } from '@components/ui/button'
import { deepEqual } from '@renderer/utils/compare'
import { FileTypeReqType } from '../types'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Textarea } from '@components/ui/textarea'
import MultiSelectTextInput from '@components/MultiSelectTextInput'
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue
} from '@components/ui/select'

interface FilesPopupFormProps {
  value: any
  update: (data: any) => void
  clear: () => void
  children: React.ReactNode
  header: string
}

const fileSchema = z.object({
  files: z.coerce.number().int().nonnegative().finite().optional(),
  size: z.coerce.number().nonnegative().finite().optional(),
  sizeUnit: z.enum(['TB', 'GB', 'MB']),
  copies: z.array(z.string()).optional()
})
type fileType = z.infer<typeof fileSchema>

export const FilesPopupForm: React.FC<FilesPopupFormProps> = ({
  value,
  update,
  clear,
  children,
  header
}) => {
  const [open, setOpen] = useState(false)
  const BYTES_IN_GB = 1e9

  const form = useForm<fileType>({
    defaultValues: {
      files: value.files || 0,
      size: value.size ? Math.round(value.size / BYTES_IN_GB) : 0,
      sizeUnit: 'GB',
      copies: value.copies ?? []
    },
    mode: 'onSubmit',
    resolver: zodResolver(fileSchema)
  })

  const { control, handleSubmit, reset } = form

  useEffect(() => {
    reset({
      files: value.files ?? 0,
      size: value.size ? Math.round(value.size / BYTES_IN_GB) : 0,
      sizeUnit: 'GB',
      copies: value.copies ?? []
    })
  }, [value])

  const onSubmit: SubmitHandler<any> = (data): void => {
    /*const { size, ...rest } = data
    const sizeInBytes = size ? size * BYTES_IN_GB : 0 // Convert from GB to Bytes
    const updated = { ...rest, Size: sizeInBytes }

    const defaultsInGB = {
      ...defaults,
      size: defaults.size ? Math.round(defaults.size / BYTES_IN_GB) : 0
    }
    if (deepEqual(data, defaultsInGB)) return
    //update(updated) // in Bytes
    reset(data) // in GB*/
  }

  return (
    <Popover open={open} onOpenChange={(v) => setOpen(v)}>
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
                name="files"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-center gap-2">
                    <FormLabel>Clips</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        className="col-span-1 h-8"
                        {...field}
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem className="grid grid-cols-3 items-center gap-2">
                <FormLabel>Size</FormLabel>

                <FormControl className="col-span-1">
                  <FormField
                    name="size"
                    render={({ field }) => (
                      <Input
                        type="text"
                        className="h-8"
                        {...field}
                        onKeyDown={(e) => {
                          const allowedKeys = [
                            'Backspace',
                            'ArrowLeft',
                            'ArrowRight',
                            'Delete',
                            'Tab',
                            '.'
                          ]
                          if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                            e.preventDefault()
                          }
                        }}
                      />
                    )}
                  />
                </FormControl>
                <FormControl>
                  <FormField
                    control={control}
                    name="sizeUnit"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-1 items-center gap-4">
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="h-8 w-16">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TB">TB</SelectItem>
                              <SelectItem value="GB">GB</SelectItem>
                              <SelectItem value="MB">MB</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
              <FormField
                name="copies"
                render={({ field }) => (
                  <FormItem className="flex flex-col mt-3">
                    <FormLabel>Copies</FormLabel>
                    <FormControl>
                      <div className="col-span-2">
                        <MultiSelectTextInput {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={() => console.log('click')}>
                Set
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
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
