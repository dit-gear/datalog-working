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
import { emailType, emailEditType } from './types'
import { emailZodObj } from '@shared/projectTypes'
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
    name: '',
    sender: '',
    recipients: [],
    subject: '',
    message: '',
    react: 'none',
    enabled: true
  }
  const form = useForm<emailType>({
    defaultValues: defaultValues,
    mode: 'onSubmit',
    resolver: zodResolver(emailZodObj)
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = form

  let currentIndex = 0 // Initialize the index counter

  const assignIndex = (): number => currentIndex++

  const onSubmit: SubmitHandler<emailType> = (data): void => {
    if (emailEdit !== null) {
      update(emailEdit.index, data)
    } else append(data)
    onOpenChange(false)
  }
  useEffect(() => {
    if (emailEdit) {
      reset(emailEdit.email)
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
          Add Email
        </Button>
      </DialogTrigger>
      <DialogContent className="border p-4">
        <DialogHeader>
          <DialogTitle>
            {emailEdit ? `Edit ${emailEdit.email.name}` : 'New Email Template'}
          </DialogTitle>
          <DialogDescription>
            {`${emailEdit ? 'Edit the' : 'Create a new'} Email template that can be used from the UI`}
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
            name={`sender`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>From:</FormLabel>
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
                {Array.isArray(errors.recipients) &&
                  errors.recipients.length > 0 &&
                  errors.recipients.map((error, index) => (
                    <FormMessage key={index}>{error.message}</FormMessage>
                  ))}
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
                      const option = { label: pdf.name, value: pdf.id }
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
                <FormLabel>React</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none">none</SelectItem>
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
              <FormItem className="flex items-center self-center gap-16">
                <FormLabel className="mt-2">Enabled?</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
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

export default EmailTemplate
