import React, { useState, useEffect } from 'react'
import { Input } from '@components/ui/input'
import { FormField, FormItem, FormControl, FormLabel, FormMessage, Form } from '@components/ui/form'
import { TemplateDirectoryFile } from '@shared/projectTypes'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@components/ui/select'
import { SubmitHandler, useForm } from 'react-hook-form'
import { pdfType, pdfEditType, pdfWithoutIDZod, pdfWitoutIDType } from '../types'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { Switch } from '@components/ui/switch'
import { nanoid } from 'nanoid/non-secure'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip'
import { Plus } from 'lucide-react'

interface PdfTemplateProps {
  append: (email: pdfType) => void
  update: (index: number, email: pdfType) => void
  emailEdit: pdfEditType | null
  setEmailEdit: (edit: pdfEditType | null) => void
  templates: TemplateDirectoryFile[]
}

const PdfTemplate: React.FC<PdfTemplateProps> = ({
  append,
  update,
  emailEdit,
  setEmailEdit,
  templates
}) => {
  const [open, setOpen] = useState<boolean>(false)

  const defaultValues = {
    label: '',
    output_name: '<log>.pdf',
    react: '',
    enabled: true
  }
  const form = useForm<pdfWitoutIDType>({
    defaultValues: defaultValues,
    mode: 'onSubmit',
    resolver: zodResolver(pdfWithoutIDZod)
  })

  const { control, handleSubmit, reset } = form

  let currentIndex = 0 // Initialize the index counter

  const assignIndex = (): number => currentIndex++

  const onSubmit: SubmitHandler<pdfWitoutIDType> = (data): void => {
    if (emailEdit !== null) {
      update(emailEdit.index, { id: emailEdit.pdf.id, ...data })
    } else {
      append({ id: nanoid(5), ...data })
    }
    onOpenChange(false)
  }
  useEffect(() => {
    if (emailEdit) {
      const { id, ...rest } = emailEdit.pdf
      reset(rest)
      setOpen(true)
    }
  }, [emailEdit])

  const onOpenChange = (open: boolean): void => {
    setOpen(open)
    if (open === false) {
      setEmailEdit(null)
      reset(defaultValues)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div>
        <DialogTrigger asChild>
          <Button type="button">
            <Plus className="mr-2 h-4 w-4" />
            Add Preset
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent className="border p-8">
        <DialogHeader>
          <DialogTitle>{emailEdit ? `Edit ${emailEdit.pdf.label}` : 'New PDF'}</DialogTitle>
          <DialogDescription>
            {`${emailEdit ? 'Edit the' : 'Create a new'} Pdf preset that can be used from the UI`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <FormField
            control={control}
            name={`label`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input {...field} data-index={assignIndex()} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`output_name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Output Name</FormLabel>
                <FormControl>
                  <Input {...field} data-index={assignIndex()} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`react`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>React Pdf Template</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {templates
                          .filter((template) => template.type === 'pdf')
                          .map((template) => (
                            <SelectItem key={template.path} value={template.name}>
                              {template.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`enabled`}
            render={({ field }) => (
              <FormItem className="flex bg-zinc-900 px-4 pt-2 pb-4 rounded-md justify-between">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="mt-2">
                      <FormLabel>Enabled</FormLabel>
                    </TooltipTrigger>
                    <TooltipContent>
                      Toggle enabled/disbled from the menu and options.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-index={assignIndex()}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" onClick={handleSubmit(onSubmit)}>
              Save
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default PdfTemplate
