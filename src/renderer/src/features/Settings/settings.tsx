import { ReactElement, useState } from 'react'
import { Button } from '@components/ui/button'
import { useForm, useFieldArray, FormProvider } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@components/ui/form'

import { ProjectSettings } from '@types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@components/ui/dialog'
import { ScrollArea } from '@components/ui/scroll-area'
import GeneralTab from './GeneralTab'
import PathsTab from './PathsTab'
import CsvParsingTab from './CsvParsingTab'
import EmailTab from './EmailTab'

const schema = z.object({
  projectName: z.string().min(1).max(80),
  project_folderTemplate: z.string().max(80).optional(),
  global_folderTemplate: z.string().max(80).optional(),
  project_unit: z.string().optional(),
  global_unit: z.string().optional(),
  project_default_ocf_paths: z.array(z.string()).optional(),
  global_default_ocf_paths: z.array(z.string()).optional(),
  project_default_proxies_path: z.string().optional(),
  global_default_proxies_path: z.string().optional(),
  project_enable_parsing: z.boolean(),
  global_enable_parsing: z.boolean()
})

interface SettingsDialogProps {
  defaultSettings: ProjectSettings
}
type Scope = 'project' | 'global'
export type schemaType = z.infer<typeof schema>

const Settings: React.FC<SettingsDialogProps> = ({ defaultSettings }) => {
  const [scope, setScope] = useState<Scope>('project')

  const form = useForm<schemaType>({
    defaultValues: {
      projectName: defaultSettings.project_name,
      project_folderTemplate: defaultSettings.folder_template,
      global_folderTemplate: '',
      project_unit: defaultSettings.unit,
      global_unit: '',
      project_default_ocf_paths: defaultSettings.default_ocf_paths || [],
      global_default_ocf_paths: [],
      project_default_proxies_path: defaultSettings.default_proxies_path,
      global_default_proxies_path: '',
      project_enable_parsing: false,
      global_enable_parsing: false
    },
    mode: 'onChange',
    resolver: zodResolver(schema)
  })
  const { control, register, watch, setValue } = form

  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>

      <DialogContent className=" w-[100vw] h-[100vh] max-w-[100vw] max-h-[100vh] bg-black/40 backdrop-blur-sm">
        <FormProvider {...form}>
          <Form {...form}>
            <Tabs
              className="mx-auto w-[90vw] gap-2 container grid md:grid-cols-[220px_minmax(0,1fr)] overflow-y-auto"
              defaultValue="general"
              orientation="vertical"
            >
              <nav className="w-full shrink-0 md:sticky md:block">
                <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
                  <TabsList className="grid grid-cols-2 mt-2">
                    <TabsTrigger value="project">This Project</TabsTrigger>
                    <TabsTrigger value="global">Global</TabsTrigger>
                  </TabsList>
                </Tabs>
                <TabsList className="flex flex-col justify-between items-start h-auto mt-2">
                  <TabsTrigger className="w-full justify-start" value="general">
                    General
                  </TabsTrigger>
                  <TabsTrigger className="w-full justify-start" value="paths">
                    OCF/Proxies Paths
                  </TabsTrigger>
                  <TabsTrigger className="w-full justify-start" value="mhl">
                    OCF Parsing
                  </TabsTrigger>
                  <TabsTrigger className="w-full justify-start" value="parsing">
                    CSV Parsing
                  </TabsTrigger>
                  <TabsTrigger className="w-full justify-start" value="emails">
                    Emails
                  </TabsTrigger>
                  <TabsTrigger className="w-full justify-start" value="email">
                    Email API
                  </TabsTrigger>
                </TabsList>
              </nav>
              <TabsContent value="general">
                <GeneralTab scope={scope} />
              </TabsContent>
              <TabsContent value="paths">
                <PathsTab
                  scope={scope}
                  control={control}
                  watch={watch}
                  setValue={setValue}
                  register={register}
                />
              </TabsContent>
              <TabsContent value="parsing">
                <CsvParsingTab scope={scope} control={control} watch={watch} setValue={setValue} />
              </TabsContent>
              <TabsContent value="email">
                <EmailTab />
              </TabsContent>

              <DialogFooter className="md:col-span-2 mt-auto">
                <DialogClose asChild>
                  <Button variant="ghost">Close</Button>
                </DialogClose>
                <Button disabled type="submit">
                  Save
                </Button>
              </DialogFooter>
            </Tabs>
          </Form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export default Settings
// className="mt-auto -mr-6 -ml-6 -mb-6 p-6 bg-card shadow-sm border"
