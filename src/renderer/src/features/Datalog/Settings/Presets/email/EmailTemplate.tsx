import React, { useState, useEffect } from 'react'
import { Input } from '@components/ui/input'
import { FormField, FormItem, FormControl, FormLabel, FormMessage, Form } from '@components/ui/form'
import { pdfType, TemplateDirectoryFile } from '@shared/projectTypes'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@components/ui/select'
import { Textarea } from '@components/ui/textarea'
import { SubmitHandler, useForm } from 'react-hook-form'
import { emailType, emailEditType, emailWithoutIDZod, emailWithoutIDType } from '../types'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@components/ui/dialog'
import MultiSelectTextInput from '@components/MultiSelectTextInput'
import MultiSelect from '@components/MultiSelect'
import { Button } from '@components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { Switch } from '@components/ui/switch'
import { getPdfAttachments } from '@shared/utils/getAttachments'
import { mapPdfTypesToOptions } from '@renderer/utils/mapPdfTypes'
import { nanoid } from 'nanoid/non-secure'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip'
import { Plus } from 'lucide-react'

interface EmailTemplateProps {
  append: (email: emailType) => void
  update: (index: number, email: emailType) => void
  emailEdit: emailEditType | null
  setEmailEdit: (edit: emailEditType | null) => void
  templates: TemplateDirectoryFile[]
  pdfs: pdfType[]
}

const EmailTemplate: React.FC<EmailTemplateProps> = ({
  append,
  update,
  emailEdit,
  setEmailEdit,
  templates,
  pdfs
}) => {
  const [open, setOpen] = useState<boolean>(false)
  const defaultValues = {
    label: '',
    recipients: [],
    subject: '',
    message: '',
    react: '',
    enabled: true
  }
  const form = useForm<emailWithoutIDType>({
    defaultValues: defaultValues,
    mode: 'onSubmit',
    resolver: zodResolver(emailWithoutIDZod)
  })

  const { control, handleSubmit, reset } = form

  let currentIndex = 0 // Initialize the index counter

  const assignIndex = (): number => currentIndex++

  const onSubmit: SubmitHandler<emailWithoutIDType> = (data): void => {
    if (emailEdit !== null) {
      update(emailEdit.index, { id: emailEdit.email.id, ...data })
    } else {
      append({ id: nanoid(5), ...data })
    }
    onOpenChange(false)
  }
  useEffect(() => {
    if (emailEdit) {
      const { id, ...rest } = emailEdit.email
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
          <DialogTitle>
            {emailEdit ? `Edit ${emailEdit.email.label}` : 'New Email Template'}
          </DialogTitle>
          <DialogDescription>
            {`${emailEdit ? 'Edit the' : 'Create a new'} Email template that can be used from the UI`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <FormField
            control={control}
            name={`label`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name / Label</FormLabel>
                <FormControl>
                  <Input {...field} data-index={assignIndex()} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`recipients`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>To:</FormLabel>
                <FormControl>
                  <MultiSelectTextInput {...field} dataIndex={assignIndex()} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`subject`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input {...field} data-index={assignIndex()} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`attachments`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attachments</FormLabel>
                <FormControl>
                  <MultiSelect
                    {...field}
                    dataIndex={assignIndex()}
                    value={mapPdfTypesToOptions(getPdfAttachments(pdfs, field.value ?? []))}
                    onChange={(newValues) => {
                      // Map selected Option objects to pdfType objects
                      const updatedAttachments = newValues
                        .map((id) => {
                          const foundPdf = pdfs.find((pdf) => pdf.id === id)
                          console.log('Selected ID -> pdf:', id, foundPdf) // Debug mapping
                          return foundPdf?.id
                        })
                        .filter(Boolean) // Remove any undefined entries

                      field.onChange(updatedAttachments) // Update the form state with pdfType objects
                    }}
                    options={pdfs.map((pdf) => {
                      const option = { label: pdf.label, value: pdf.id }
                      return option
                    })}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`message`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea {...field} data-index={assignIndex()} />
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {templates
                          .filter((template) => template.type === 'email')
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
          <DialogFooter className="mt-4">
            <Button type="button" onClick={handleSubmit(onSubmit)}>
              Save
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EmailTemplate
