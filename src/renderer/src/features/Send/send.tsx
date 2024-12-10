import { FormField, FormItem, FormControl, FormLabel, FormMessage, Form } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import MultiSelectTextInput from '@components/MultiSelectTextInput'
import MultiSelect from '@components/MultiSelect'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Button } from '@components/ui/button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@components/ui/resizable'
import { emailType, emailZodObj } from '@shared/projectTypes'
import { getPdfAttachments, mapPdfTypesToOptions } from '@shared/utils/getAttachments'
import { useDataContext } from './dataContext'
import { Previews } from './preview/previews'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

interface SendProps {
  defaults: emailType | null
}

const Send = ({ defaults }: SendProps) => {
  const { projectPdfs } = useDataContext()
  const form = useForm<emailType>({
    defaultValues: {
      recipients: defaults?.recipients ?? [],
      subject: defaults?.subject ?? '',
      attachments: defaults?.attachments ?? [],
      message: defaults?.message ?? '',
      react: defaults?.react ?? ''
    },
    mode: 'onSubmit'
    //resolver: zodResolver(emailZodObj) // maybe omit name, sender from validation.
  })

  const {
    control,
    formState: { isSubmitting, isSubmitSuccessful },
    handleSubmit
  } = form

  const onSubmit: SubmitHandler<emailType> = async (data) => {
    try {
      await window.sendApi.sendEmail(data)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="min-h-[calc(100vh-36px)] border-t flex flex-col">
      <Form {...form}>
        <ResizablePanelGroup className="flex-grow pb-20" direction="horizontal">
          <ResizablePanel className="px-8 mt-4" defaultSize={40} maxSize={75}>
            <div className="flex flex-col flex-grow gap-4 h-full pb-4">
              <FormField
                control={control}
                name={`recipients`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To:</FormLabel>
                    <FormControl>
                      <MultiSelectTextInput dataIndex={0} {...field} />
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
                        dataIndex={1}
                        menuPosition="fixed"
                        {...field}
                        value={mapPdfTypesToOptions(
                          getPdfAttachments(projectPdfs, field.value ?? [])
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
                        options={projectPdfs.map((pdf) => {
                          const option = { label: pdf.name, value: pdf.id }
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
          <ResizablePanel className="mx-8 overflow-visible" defaultSize={60} maxSize={75}>
            <Previews />
          </ResizablePanel>
        </ResizablePanelGroup>
        <div className="fixed bottom-0 left-0 w-full flex justify-between gap-4 p-4 border-t">
          <div className="">
            <p className="text-xs text-blue-400">Message from today's sponsor:</p>
            <span className="text-sm">
              {
                [
                  'Tech.store: Raid X20 just dropped. Amazing speeds of 2500MB/s!',
                  'GadgetHub: 30% off all label printers today!',
                  'SpeedyMart: Free shipping on orders over $500!'
                ][Math.floor(Math.random() * 3)]
              }
              <Button
                variant="link"
                className="h-auto  py-0 pl-1 text-xs font-normal text-blue-400 underline"
              >
                {['Read more', 'Visit store', 'Press release', ''][Math.floor(Math.random() * 3)]}
              </Button>
            </span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => window.sendApi.closeSendWindow()}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting || isSubmitSuccessful}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <></>}
              {isSubmitting ? 'Please wait' : isSubmitSuccessful ? 'Sent sucessfully' : 'Send'}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  )
}

//<div className="min-h-[calc(100vh-36px)] border-t flex flex-col">

export default Send
