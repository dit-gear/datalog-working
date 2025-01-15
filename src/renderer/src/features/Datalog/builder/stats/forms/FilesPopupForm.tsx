import { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { FormControl, FormField, FormItem, FormLabel, Form, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Button } from '@components/ui/button'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import MultiSelectTextInput from '@components/MultiSelectTextInput'
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue
} from '@components/ui/select'
import { formatBytes, convertToBytes } from '@shared/utils/format-bytes'
import { compareSizes } from '@renderer/utils/compare'

interface FilesPopupFormProps {
  value: fileFormType | null
  update: (data: any) => void
  clear: () => void
  children: React.ReactNode
  header: string
  enableCopies: boolean
}

const fileSchema = z.object({
  files: z.coerce.number().int().nonnegative().finite(),
  size: z.coerce.number().nonnegative().finite(),
  sizeUnit: z.enum(['tb', 'gb', 'mb']),
  copies: z.array(z.string()).optional()
})
const req = fileSchema.required()
export type fileFormType = z.infer<typeof fileSchema>
export type fileFormTypeRequired = z.infer<typeof req>

export const FilesPopupForm: React.FC<FilesPopupFormProps> = ({
  value,
  update,
  clear,
  children,
  header,
  enableCopies
}) => {
  const [open, setOpen] = useState(false)
  //const BYTES_IN_GB = 1e9

  const form = useForm<fileFormType>({
    defaultValues: {
      files: value?.files ?? 0,
      size: value?.size ?? 0,
      sizeUnit: 'gb',
      copies: value?.copies ?? []
    },
    mode: 'onSubmit',
    resolver: zodResolver(fileSchema)
  })

  const { control, handleSubmit, reset } = form

  useEffect(() => {
    reset({
      files: value?.files ?? 0,
      size: value?.size ? formatBytes(value.size, { output: 'number', type: 'gb' }) : 0,
      sizeUnit: 'gb',
      copies: value?.copies ?? []
    })
  }, [value])

  const onSubmit: SubmitHandler<fileFormType> = (data): void => {
    if (!value) return
    const sizeInBytes = data.size ? convertToBytes(data.size, data.sizeUnit) : 0
    console.log('compareSizes result:', compareSizes(value.size, data.size, data.sizeUnit))
    const set = {
      files: data.files !== value.files ? data.files : null,
      size: compareSizes(value.size, data.size, data.sizeUnit) ? null : sizeInBytes,
      copies:
        data.copies &&
        value.copies &&
        data.copies.slice().sort().join() !== value.copies.slice().sort().join()
          ? data.copies
          : null
    }
    setOpen(false)
    update(set)
  }

  return (
    <Popover open={open} onOpenChange={(v) => setOpen(v)}>
      <PopoverTrigger className="min-w-12 min-h-10 text-left rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Form {...form}>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4
                className={`font-medium leading-none ${header === 'ocf' ? 'uppercase' : 'capitalize'}`}
              >
                {header}
              </h4>
              <p className="text-sm text-muted-foreground">Set the number of clips and size.</p>
            </div>
            <div className="grid gap-2">
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
                              <SelectItem value="tb">TB</SelectItem>
                              <SelectItem value="gb">GB</SelectItem>
                              <SelectItem value="mb">MB</SelectItem>
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
              {enableCopies && (
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
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={handleSubmit(onSubmit)}>
                Set
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setOpen(false)
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
