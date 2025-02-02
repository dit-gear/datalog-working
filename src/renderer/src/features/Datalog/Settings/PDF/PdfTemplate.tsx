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
import { pdfType, pdfEditType, pdfWitoutIDType } from './types'
import { pdfZodObj } from '@shared/projectTypes'
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
    name: '',
    output_name_pattern: '',
    react: 'none',
    enabled: true
  }
  const form = useForm<pdfWitoutIDType>({
    defaultValues: defaultValues,
    mode: 'onSubmit',
    resolver: zodResolver(pdfZodObj.omit({ id: true }))
  })

  const { control, handleSubmit, reset } = form

  let currentIndex = 0 // Initialize the index counter

  const assignIndex = (): number => currentIndex++

  const onSubmit: SubmitHandler<pdfWitoutIDType> = (data): void => {
    console.log('emailedit:', emailEdit?.pdf.id)
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
      <DialogTrigger asChild>
        <Button type="button" variant="secondary">
          Add Pdf
        </Button>
      </DialogTrigger>
      <DialogContent className="border p-4">
        <DialogHeader>
          <DialogTitle>{emailEdit ? `Edit ${emailEdit.pdf.name}` : 'New PDF Template'}</DialogTitle>
          <DialogDescription>
            {`${emailEdit ? 'Edit the' : 'Create a new'} Pdf template that can be used from the UI`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <FormField
            control={control}
            name={`name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template name</FormLabel>
                <FormControl>
                  <Input {...field} data-index={assignIndex()} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`output_name_pattern`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Output Name Pattern:</FormLabel>
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
                <FormLabel>React Email Template</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none">none</SelectItem>
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
              <FormItem>
                <FormLabel>Enabled</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-index={assignIndex()}
                  />
                </FormControl>
                <FormMessage />
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
