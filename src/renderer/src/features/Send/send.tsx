import { FormField, FormItem, FormControl, FormLabel, FormMessage, Form } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import MultiSelectTextInput from '@components/MultiSelectTextInput'
import { useForm } from 'react-hook-form'
import { Button } from '@components/ui/button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@components/ui/resizable'
import { Tabs, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { TabsList } from '@radix-ui/react-tabs'

const Send = () => {
  const form = useForm({
    mode: 'onSubmit'
  })
  const { control } = form
  return (
    <div className="min-h-[calc(100vh-36px)] border-t flex flex-col">
      <ResizablePanelGroup className="flex-grow pb-20" direction="horizontal">
        <ResizablePanel className="px-8 mt-4" defaultSize={40} maxSize={75}>
          <Form {...form}>
            <FormField
              control={control}
              name={`sender`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From:</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/*<FormField
        control={control}
        name={`recipients`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>To:</FormLabel>
            <FormControl>
              <MultiSelectTextInput {...field} />
            </FormControl>
            {Array.isArray(errors.recipients) &&
              errors.recipients.length > 0 &&
              errors.recipients.map((error, index) => (
                <FormMessage key={index}>{error.message}</FormMessage>
              ))}
          </FormItem>
        )}
      />*/}
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
            {/*<FormField
        control={control}
        name={`attatchments`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Attatchments</FormLabel>
            <FormControl>
              <MultiSelectTextInput {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />*/}
            <FormField
              control={control}
              name={`body`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                Email
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
