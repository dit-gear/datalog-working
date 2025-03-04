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
import { Loader2, Send as Sendicon, Check, AlertCircle } from 'lucide-react'
import { Toaster } from '@components/ui/toaster'
import { useToast } from '@components/lib/hooks/use-toast'
import { useTags, useStringWithTags } from './utils/useTags'
import { useData } from './utils/useData'
import Preview from '@components/Preview'
import { Header } from './preview/Header'
import { useEmailApi } from '@renderer/utils/useCheckEmailAPI'

interface SendProps {
  defaults: emailType | null
}

const Send = ({ defaults }: SendProps) => {
  const { data } = useData()
  const { data: hasEmailConfig, isLoading, refetch } = useEmailApi()
  const projectPdfs = data?.project.pdfs ?? []
  const projectTemplates = data?.project?.templatesDir?.filter((val) => val.type === 'email') ?? []
  const tags = useTags(data!)
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
        {!hasEmailConfig && (
          <div className="absolute bottom-20 left-8 right-8 z-40 bg-zinc-950 border-2 border-red-900 text-sm p-4 rounded-lg shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span>
                <strong>Email API Configuration Missing:</strong> Set up the Email API in Project
                Settings to enable email functionality.
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button type="button" size="sm" onClick={() => refetch()}>
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
                isSubmitting || (isSubmitSuccessful && sentSuccess) || isLoading || !hasEmailConfig
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
