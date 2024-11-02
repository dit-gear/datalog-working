import { FormField, FormItem, FormControl, FormLabel, FormMessage, Form } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import MultiSelectTextInput from '@components/MultiSelectTextInput'
import { useForm } from 'react-hook-form'
import { Button } from '@components/ui/button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@components/ui/resizable'
import { Tabs, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { TabsList } from '@radix-ui/react-tabs'
import { Settings } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { Select, SelectContent, SelectItem, SelectValue } from '@components/ui/select'
import { SelectTrigger } from '@components/SelectIconTrigger'
import { emailType } from '@shared/projectTypes'

interface SendProps {
  defaults: emailType | null
}

const Send = ({ defaults }: SendProps) => {
  const form = useForm({
    defaultValues: {
      recipients: defaults?.recipients ?? [],
      subject: defaults?.subject ?? '',
      attatchments: defaults?.attatchments ?? [],
      message: defaults?.message ?? '',
      reacttemplate: defaults?.template ?? ''
    },
    mode: 'onSubmit'
  })
  const { control } = form
  return (
    <div className="min-h-[calc(100vh-36px)] border-t flex flex-col">
      <ResizablePanelGroup className="flex-grow pb-20" direction="horizontal">
        <ResizablePanel className="px-8 mt-4" defaultSize={40} maxSize={75}>
          <Form {...form}>
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
                name={`attatchments`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attatchments</FormLabel>
                    <FormControl>
                      <MultiSelectTextInput dataIndex={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="mx-8 overflow-visible" defaultSize={60} maxSize={75}>
          <Tabs defaultValue="email" className="overflow-visible">
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
                  <Select defaultValue={'datalog.jsx'}>
                    <SelectTrigger></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="datalog.jsx">datalog.jsx</SelectItem>
                      <SelectItem value="dark">logilog.jsx</SelectItem>
                      <SelectItem value="system">lensreport.jsx</SelectItem>
                    </SelectContent>
                  </Select>
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="datalog.pdf"
                className="border-t border-l border-r rounded-t-lg px-4 pb-2"
              >
                datalog.pdf
              </TabsTrigger>
            </TabsList>
            <TabsContent value="email">email</TabsContent>
            <TabsContent value="datalog.pdf">pdf</TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
      <div className="fixed bottom-0 left-0 w-full flex justify-end gap-4 p-4 border-t">
        <Button variant="ghost">Cancel</Button>
        <Button>Send</Button>
      </div>
    </div>
  )
}

//<div className="min-h-[calc(100vh-36px)] border-t flex flex-col">

export default Send
