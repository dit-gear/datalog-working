import { useState } from 'react'
import { FormField, FormItem, FormControl, FormLabel, FormMessage, Form } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import MultiSelectTextInput from '@components/MultiSelectTextInput'
import MultiSelect from '@components/MultiSelect'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@components/ui/button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@components/ui/resizable'
import { emailType, emailZodObj } from '@shared/projectTypes'
import { getPdfAttachments } from '@shared/utils/getAttachments'
import { mapPdfTypesToOptions } from '@renderer/utils/mapPdfTypes'
import { Loader2, Send as Sendicon, Check, AlertCircle, WifiOff } from 'lucide-react'
import { Toaster } from '@components/ui/toaster'
import { useToast } from '@components/lib/hooks/use-toast'
import { useTags, useStringWithTags } from './utils/useTags'
import { useData } from './utils/useData'
import Preview from '@components/Preview'
import { Header } from './preview/Header'
import { useEmailApi } from '@renderer/utils/useCheckEmailAPI'
import { useOnlineStatus } from '@renderer/utils/OnlineStatus'

interface SendProps {
  defaults: emailType | null
}

const Send = ({ defaults }: SendProps) => {
  const { data } = useData()
  const { data: hasEmailConfig, isLoading, refetch } = useEmailApi()
  const hasNoSender = !data?.project.email_sender
  const projectPdfs = data?.project.pdfs ?? []
  const projectTemplates = data?.project?.templatesDir?.filter((val) => val.type === 'email') ?? []
  const tags = useTags(data!)
  const isOnline = useOnlineStatus()
  const [sentSuccess, setSendSuccess] = useState<boolean>(false)
  const { toast } = useToast()
  const form = useForm<emailType>({
    defaultValues: {
      recipients: defaults?.recipients ?? [],
      subject:
        data && defaults?.subject
          ? useStringWithTags(data, defaults.subject, defaults.subject)
          : '',
      attachments: defaults?.attachments ?? [],
      message:
        data && defaults?.message
          ? useStringWithTags(data, defaults.message, defaults.message)
          : '',
      react: defaults?.react ?? projectTemplates[0].name
    },
    mode: 'onSubmit',
    resolver: zodResolver(emailZodObj.omit({ enabled: true, id: true, label: true }))
  })

  const {
    control,
    formState: { isSubmitting, isSubmitSuccessful, errors },
    handleSubmit
  } = form

  console.log(errors)

  const onSubmit: SubmitHandler<emailType> = async (data) => {
    try {
      const res = await window.sendApi.sendEmail(data)
      if (res.success) {
        setSendSuccess(true)
        window.sendApi.closeSendWindow()
      } else throw new Error(res.error)
    } catch (error) {
      const errormessage =
        error instanceof Error ? error.message : 'Unknown error, please check error log.'
      console.log(errormessage)
      toast({ variant: 'destructive', title: 'Error:', description: errormessage })
    }
  }

  return (
    <div className="h-dvh flex flex-col">
      <Form {...form}>
        <ResizablePanelGroup className="flex-grow pb-20" direction="horizontal">
          <ResizablePanel className="px-8 mt-12" defaultSize={40} maxSize={75}>
            <div className="flex flex-col flex-grow gap-4 h-full pb-4">
              <FormField
                control={control}
                name={`recipients`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To:</FormLabel>
                    <FormControl>
                      <MultiSelectTextInput {...field} />
                    </FormControl>
                    {/*Array.isArray(errors.recipients) &&
              errors.recipients.length > 0 &&
              errors.recipients.map((error, index) => (
                <FormMessage key={index}>{error.message}</FormMessage>
              ))*/}
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`message`}
                render={({ field }) => (
                  <FormItem className="flex flex-col flex-grow h-full">
                    <FormLabel>Message</FormLabel>
                    <FormControl className="flex-grow h-full">
                      <Textarea {...field} className="h-full resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`attachments`}
                render={({ field }) => (
                  <FormItem className="overflow-visible">
                    <FormLabel>Attachments</FormLabel>
                    <FormControl>
                      <MultiSelect
                        menuPosition="fixed"
                        {...field}
                        value={mapPdfTypesToOptions(
                          getPdfAttachments(projectPdfs, field.value ?? []),
                          tags ?? undefined
                        )}
                        onChange={(newValues) => {
                          const updatedAttachments = newValues
                            .map((id) => {
                              const foundPdf = projectPdfs.find((pdf) => pdf.id === id)
                              return foundPdf?.id
                            })
                            .filter(Boolean)

                          field.onChange(updatedAttachments)
                        }}
                        options={projectPdfs
                          ?.filter((pdf) => pdf.enabled)
                          .map((pdf) => {
                            const option = { label: pdf.label, value: pdf.id }
                            return option
                          })}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel className="ml-8 mr-4" defaultSize={60} maxSize={75}>
            <Header />
            <Preview />
          </ResizablePanel>
        </ResizablePanelGroup>
        {!isOnline && (
          <div className="absolute bottom-24 z-40 inset-x-8 bg-red-50 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 py-4 px-6 rounded-lg shadow-lg flex items-start space-x-3">
            <WifiOff className="h-6 w-6 text-red-600 dark:text-red-300 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">You're offline</p>
            </div>
          </div>
        )}
        {hasNoSender && (
          <div className="absolute bottom-24 z-40 inset-x-8 bg-red-50 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 py-4 px-6 rounded-lg shadow-lg flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-300 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">No Sender Address Configured</p>
              <p>Please add a ‘From’ address in Settings before sending emails.</p>
            </div>
          </div>
        )}
        {!hasEmailConfig && (
          <div className="absolute bottom-24 z-40 inset-x-8 bg-red-50 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 py-4 px-6 rounded-lg shadow-lg flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-300 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">No Email API Configured</p>
              <p> Please add a Email API in Settings before sending emails.</p>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={() => refetch()}
              variant="secondary"
              className="mt-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                <>Refresh</>
              )}
            </Button>
          </div>
        )}
        <div className="fixed bottom-0 w-full justify-end flex p-4 border-t">
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => window.sendApi.closeSendWindow()}>
              {isSubmitSuccessful && sentSuccess ? 'Close window' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={
                isSubmitting ||
                (isSubmitSuccessful && sentSuccess) ||
                isLoading ||
                !hasEmailConfig ||
                hasNoSender ||
                !isOnline
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : isSubmitSuccessful && sentSuccess ? (
                <>
                  <Check className="mr-2 h-4 w-4 animate-fadeInMove" />
                  Sent Successfully
                </>
              ) : (
                <>
                  <Sendicon className="mr-2 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </Form>
      <Toaster />
    </div>
  )
}

export default Send
