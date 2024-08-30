import { useState, useMemo } from 'react'
import { Button } from '@components/ui/button'
import { Settings2 } from 'lucide-react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@components/ui/form'

import { ProjectSettingsType } from '@shared/projectTypes'
import { formSchemaType, formSchema, Scope } from './types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  Dialogheader,
  DialogDescription,
  DialogTrigger,
  DialogClose,
  DialogTitle,
  DialogHeader
} from '@components/ui/dialog'
import GeneralTab from './GeneralTab'
import PathsTab from './PathsTab'
import ParsingTab from './Parsing/ParsingTab'
import EmailTab from './Email/EmailTab'

interface SettingsDialogProps {
  defaults: ProjectSettingsType
}

const Settings: React.FC<SettingsDialogProps> = ({ defaults }) => {
  const [scope, setScope] = useState<Scope>('project')

  const defaultValues = useMemo(
    () => ({
      project_project_name: defaults.project?.project_name ?? '',
      project_folder_template: defaults.project?.folder_template ?? '',
      project_unit: defaults.project?.unit ?? '',
      project_default_ocf_paths: defaults.project?.default_ocf_paths ?? [],
      project_default_proxies_path: defaults.project?.default_proxies_path ?? '',
      project_parse_camera_metadata: defaults.project?.parse_camera_metadata ?? true,
      project_additional_parsing: defaults.project?.additional_parsing ?? undefined,
      project_emails: defaults.project?.emails ?? [],
      project_email_api: defaults.project?.email_api ?? undefined,
      global_folder_template: defaults.global?.folder_template ?? '',
      global_unit: defaults.global?.unit ?? '',
      global_default_ocf_paths: defaults.global?.default_ocf_paths ?? [],
      global_default_proxies_path: defaults.global?.default_proxies_path ?? '',
      global_parse_camera_metadata: defaults.global?.parse_camera_metadata ?? true,
      global_additional_parsing: defaults.global?.additional_parsing ?? undefined,
      global_emails: defaults.global?.emails ?? [],
      global_email_api: defaults.global?.email_api ?? undefined,
      project_enable_parsing: false,
      global_enable_parsing: false
    }),
    [defaults]
  )

  const form = useForm<formSchemaType>({
    defaultValues: defaultValues,
    mode: 'onBlur',
    resolver: zodResolver(formSchema)
  })

  console.log('1')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className=" w-[100vw] h-[100vh] max-w-[100vw] max-h-[100vh] bg-black/40 backdrop-blur-sm">
        <DialogHeader className="hidden">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Settings</DialogDescription>
        </DialogHeader>
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
                  <TabsTrigger className="w-full justify-start" value="parsing">
                    Parsing
                  </TabsTrigger>
                  <TabsTrigger className="w-full justify-start" value="email">
                    Email
                  </TabsTrigger>
                </TabsList>
              </nav>
              <TabsContent value="general">
                <GeneralTab scope={scope} />
              </TabsContent>
              <TabsContent value="paths">
                <PathsTab scope={scope} />
              </TabsContent>
              <TabsContent value="parsing">
                <ParsingTab scope={scope} />
              </TabsContent>
              <TabsContent value="email">
                <EmailTab scope={scope} />
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
