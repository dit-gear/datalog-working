import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@components/ui/select'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import { generatePassword } from '@renderer/utils/generatePassword'
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from '@components/ui/form'
import { useFormContext, useForm, SubmitHandler } from 'react-hook-form'
import { emailApiType, emailApiZodObj } from '@shared/projectTypes'
import { zodResolver } from '@hookform/resolvers/zod'
import { formSchemaType } from '../types'

const ApiKeyDialog: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false)
  const [generateMessage, setGenerateMessage] = useState<string | null>(null)
  const { setValue: setMasterValue } = useFormContext<formSchemaType>()

  const defaultValues = {
    api_key: '',
    api_secret: ''
  }

  const form = useForm<emailApiType>({
    defaultValues: defaultValues,
    mode: 'onSubmit',
    resolver: zodResolver(emailApiZodObj)
  })

  const { control, handleSubmit, setValue, reset } = form

  const handleGeneratePassword = async (): Promise<void> => {
    const generated = await generatePassword()
    generated.message && setGenerateMessage(generated.message)
    generated.password && setValue('api_secret', generated.password, { shouldValidate: true })
  }

  const onSubmit: SubmitHandler<emailApiType> = (data): void => {
    setMasterValue('new_email_api', data)
    onOpenChange(false)
  }

  const onOpenChange = (open: boolean): void => {
    setOpen(open)
    if (open === false) {
      reset(defaultValues)
      setGenerateMessage(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary">Set API Key</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set API Key</DialogTitle>
          <DialogDescription>
            Choose a password that you will remember to access the encrypted API-key.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              key={'provider'}
              control={control}
              name={'provider'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="resend">Resend</SelectItem>
                          <SelectItem value="sendgrid">Sendgrid</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              key={'api_key'}
              control={control}
              name={'api_key'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              key={'api_secret'}
              control={control}
              name={'api_secret'}
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Password</FormLabel>
                    {generateMessage ? (
                      <p>{generateMessage}</p>
                    ) : (
                      <Button size="sm" variant="link" onClick={handleGeneratePassword}>
                        Generate
                      </Button>
                    )}
                  </div>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Set</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default ApiKeyDialog
