import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
  FormDescription
} from '@components/ui/form'
import { Card, CardHeader, CardTitle, CardDescription } from '@components/ui/card'
import { useFormContext, useForm, SubmitHandler } from 'react-hook-form'
import { emailApiType, emailApiZodObj, emailProvidersZod } from '@shared/projectTypes'
import { zodResolver } from '@hookform/resolvers/zod'
import { formSchemaType } from '../../types'
import Headers from './Headers'
import { Info } from 'lucide-react'
import z from 'zod'

const infoText = (provider: z.infer<typeof emailProvidersZod>): string => {
  switch (provider) {
    case 'custom':
      return 'Set URL and headers. Content-Type is already defined.'
    case 'postmark':
      return 'Get the API Key from your Postmark account and paste it here'
    case 'resend':
      return 'Get the API Key from your Resend account and paste it here'
    case 'sendgrid':
      return 'Get the URL and API Key from your Sendgrid account and paste it here'
    default:
      return ''
  }
}

const ApiKeyDialog: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false)
  const { setValue: setMasterValue } = useFormContext<formSchemaType>()

  const defaultValues = {
    api_key: '',
    api_secret: ''
  }

  const form = useForm<emailApiType>({
    defaultValues: defaultValues,
    mode: 'onBlur',
    resolver: zodResolver(emailApiZodObj)
  })

  const { control, handleSubmit, watch, reset } = form
  const provider = watch('provider')

  const onSubmit: SubmitHandler<emailApiType> = (data): void => {
    setMasterValue('new_email_api', data)
    onOpenChange(false)
  }

  const onOpenChange = (open: boolean): void => {
    setOpen(open)
    if (open === false) {
      reset(defaultValues)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button">Set Email API</Button>
      </DialogTrigger>
      <DialogContent className="p-8">
        <DialogHeader>
          <DialogTitle>Set Email API</DialogTitle>
          <DialogDescription>Select your email provider or a custom API endpoint</DialogDescription>
        </DialogHeader>
        <Form {...form}>
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
                        <SelectLabel className="font-normal text-xs text-muted-foreground  underline underline-offset-8">
                          Custom Endpoint
                        </SelectLabel>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="mt-2 font-normal text-xs text-muted-foreground  underline underline-offset-8">
                          Email Providers
                        </SelectLabel>
                        <SelectItem value="postmark">Postmark</SelectItem>
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
          {provider && (
            <Card className="flex flex-col gap-4 border rounded-md p-6 pb-8">
              <CardHeader className="p-0">
                <CardTitle className="capitalize">{provider}</CardTitle>
                <CardDescription>{infoText(provider)}</CardDescription>
              </CardHeader>
              {/*<div className="rounded-md bg-blue-950 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info aria-hidden="true" className="h-5 w-5 text-blue-200" />
                  </div>
                  <div className="ml-3 flex-1 md:flex md:justify-between">
                    <p className="text-sm text-blue-200">{infoText(provider)}</p>
                  </div>
                </div>
              </div>*/}
              {(provider === 'custom' || provider === 'sendgrid') && (
                <FormField
                  key={'url'}
                  control={control}
                  name={'url'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {provider !== 'custom' ? (
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
              ) : (
                <Headers control={control} />
              )}
              {/*<div className="p-4 rounded-md bg-zinc-900">
            <FormField
              key={'sender'}
              control={control}
              name={'sender'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From-address</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormDescription>Set the sender email</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>*/}
            </Card>
          )}

          <DialogFooter className="flex mt-4 gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSubmit(onSubmit)}>
              Set
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default ApiKeyDialog
