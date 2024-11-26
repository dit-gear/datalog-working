import { FormField, FormItem, FormControl, FormLabel, FormMessage, Form } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import MultiSelectTextInput from '@components/MultiSelectTextInput'
import MultiSelect from '@components/MultiSelect'
import { useForm } from 'react-hook-form'
import { Button } from '@components/ui/button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@components/ui/resizable'
import { Tabs, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { TabsList } from '@radix-ui/react-tabs'
import { Select, SelectContent, SelectItem } from '@components/ui/select'
import { SelectTrigger } from '@components/SelectIconTrigger'
import { emailType, emailZodObj, pdfType, TemplateDirectoryFile } from '@shared/projectTypes'
import { getFileName } from '@renderer/utils/formatString'
import { getPdfAttachments, mapPdfTypesToOptions } from '../../utils/getAttachments'
import { EmailPreview } from './emailPreview'
import { AttachmentsTabs } from './attachmentsTabs'

interface SendProps {
  defaults: emailType | null
  projectPdfs: pdfType[]
  projectTemplates: TemplateDirectoryFile[]
}

const Send = ({ defaults, projectPdfs, projectTemplates }: SendProps) => {
  //const pdfs = defaults?.attachments ? getPdfAttachments(projectPdfs, defaults.attachments) : []
  const form = useForm<emailType>({
    defaultValues: {
      recipients: defaults?.recipients ?? [],
      subject: defaults?.subject ?? '',
      attachments: defaults?.attachments ?? [],
      message: defaults?.message ?? '',
      react: defaults?.react ?? ''
    },
    mode: 'onSubmit'
  })

  const { control } = form
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
                          // Map selected Option objects to pdfType objects
                          const updatedAttachments = newValues
                            .map((id) => {
                              const foundPdf = projectPdfs.find((pdf) => pdf.id === id)
                              console.log('Selected ID -> pdf:', id, foundPdf) // Debug mapping
                              return foundPdf?.id
                            })
                            .filter(Boolean) // Remove any undefined entries

                          field.onChange(updatedAttachments) // Update the form state with pdfType objects
                        }}
                        options={projectPdfs.map((pdf) => {
                          const option = { label: pdf.name, value: pdf.id }
                          console.log('Mapping pdf for options:', option) // Debug options mapping
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
            <Tabs defaultValue="email" className="overflow-visible h-full">
              <TabsList
                className="absolute -mt-10 overflow-visible z-20 flex gap-1"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              >
                <TabsTrigger
                  value="email"
                  className="border-t border-l border-r rounded-t-lg px-4 pb-2"
                >
                  <span className="flex gap-4 h-4 items-center">
                    Email Preview
                    <FormField
                      control={control}
                      name="react"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              defaultValue={field.value}
                              onValueChange={(value) => field.onChange(value)} // Update the form state
                            >
                              <SelectTrigger />
                              <SelectContent>
                                <SelectItem value="plain-text">Plain-text</SelectItem>
                                {projectTemplates
                                  .filter((template) => template.type === 'email')
                                  .map((template) => (
                                    <SelectItem key={template.path} value={template.path}>
                                      {getFileName(template.path)}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </span>
                </TabsTrigger>
                <AttachmentsTabs />
              </TabsList>
              <TabsContent value="email" className="h-full w-full">
                <EmailPreview />
              </TabsContent>
              <TabsContent value="pdf">pdf</TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
        <div className="fixed bottom-0 left-0 w-full flex justify-end gap-4 p-4 border-t">
          <Button variant="ghost" onClick={() => window.sendApi.closeSendWindow()}>
            Cancel
          </Button>
          <Button>Send</Button>
        </div>
      </Form>
    </div>
  )
}

//<div className="min-h-[calc(100vh-36px)] border-t flex flex-col">

export default Send
