import React, { useState, useEffect } from 'react'
import { Input } from '@components/ui/input'
import { FormField, FormItem, FormControl, FormLabel, FormMessage, Form } from '@components/ui/form'
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
import { emailType, emailEditType, emailZodObj } from './types'
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
import { Button } from '@components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'

interface EmailTemplateProps {
  append: (email: emailType) => void
  update: (index: number, email: emailType) => void
  emailEdit: emailEditType | null
  setEmailEdit: (edit: emailEditType | null) => void
}

const EmailTemplate: React.FC<EmailTemplateProps> = ({
  append,
  update,
  emailEdit,
  setEmailEdit
}) => {
  const [open, setOpen] = useState<boolean>(false)
  const defaultValues = {
    name: '',
    show: { item: false, root: false },
    sender: '',
    recipients: [],
    subject: '',
    body: '',
    template: 'Plain-Text'
  }
  const form = useForm<emailType>({
    defaultValues: defaultValues,
    mode: 'onChange',
    resolver: zodResolver(emailZodObj)
  })

  const { control, handleSubmit, reset } = form

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
      //console.log(emailEdit)
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
        <Button variant="secondary">Add Email</Button>
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
          <form onSubmit={handleSubmit(onSubmit)}>
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
                  <FormMessage />
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
              name={`attatchments`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attatchments</FormLabel>
                  <FormControl>
                    <MultiSelectTextInput {...field} dataIndex={assignIndex()} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`body`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea {...field} data-index={assignIndex()} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`template`}
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
                          <SelectItem value="Plain-Text">Plain Text</SelectItem>
                          <SelectItem value="starter.jsx">starter.jsx</SelectItem>
                          <SelectItem value="starter2.jsx">starter2.jsx</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EmailTemplate
