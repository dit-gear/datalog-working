import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { Button } from '@components/ui/button'
import { Settings2, Loader2 } from 'lucide-react'
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@components/ui/form'
import { removeEmptyFields, removePrefixFields } from '@renderer/utils/form'
import { ProjectSettingsType, ProjectType } from '@shared/projectTypes'
import { formSchemaType, formSchema, Scope } from './types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { ScrollArea } from '@components/ui/scroll-area'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTrigger,
  DialogClose,
  DialogTitle
} from '@components/ui/dialog'
import GeneralTab from './GeneralTab'
import PathsTab from './Paths/PathsTab'
import ParsingTab from './Parsing/ParsingTab'
import EmailTab from './Email/EmailTab'

interface SettingsDialogProps {
  defaults: ProjectSettingsType
  setProject: Dispatch<SetStateAction<ProjectType | undefined>>
}

const Settings: React.FC<SettingsDialogProps> = ({ defaults, setProject }) => {
  const [scope, setScope] = useState<Scope>('project')
  const [open, setOpen] = useState<boolean>(false)

  useEffect(() => {
    reset(defaultValues(defaults))
  }, [defaults])

  const defaultValues = (defaults: ProjectSettingsType) => ({
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
    project_enable_parsing: !!defaults.project?.additional_parsing,
    global_enable_parsing: !!defaults.global?.additional_parsing
  })

  const form = useForm<formSchemaType>({
    defaultValues: defaultValues(defaults),
    mode: 'onBlur',
    resolver: zodResolver(formSchema)
  })
  const {
    handleSubmit,
    formState: { isSubmitting, isSubmitSuccessful },
    reset
  } = form

  const onSubmit: SubmitHandler<formSchemaType> = async (data) => {
    const cleanedData = removeEmptyFields(data, [
      'project_enable_parsing',
      'global_enable_parsing'
    ]) as formSchemaType
    const projectfields = removePrefixFields(cleanedData, 'project')
    const globalfields = removePrefixFields(cleanedData, 'global')
    const update_email_api = {}
    const update_settings = { project: projectfields, global: globalfields } as ProjectSettingsType

    try {
      const result = await window.api.updateProject({ update_settings, update_email_api })
      if (result.success) {
        setProject(result.project)
        console.log('project should be set with:', result.project)
        onOpenChange(false)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const onOpenChange = (open: boolean): void => {
    setOpen(open)
    if (open === false) {
      reset(defaultValues(defaults))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className=" w-[100vw] h-[100vh] max-w-[100vw] max-h-[100vh] pt-0 bg-black/40 backdrop-blur-sm">
        <DialogHeader className="hidden">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Settings</DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <Form {...form}>
            <form id="settings" onSubmit={handleSubmit(onSubmit)}>
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
                      Default Paths
                    </TabsTrigger>
                    <TabsTrigger className="w-full justify-start" value="parsing">
                      Parsing
                    </TabsTrigger>
                    <TabsTrigger className="w-full justify-start" value="email">
                      Email
                    </TabsTrigger>
                  </TabsList>
                </nav>
                <ScrollArea className="h-[90vh]">
                  <TabsContent value="general">
                    <GeneralTab scope={scope} />
                  </TabsContent>
                  <TabsContent value="paths">
                    <PathsTab scope={scope} />
                  </TabsContent>
                  <TabsContent value="parsing" className="mt-0 pt-2">
                    <ParsingTab scope={scope} />
                  </TabsContent>
                  <TabsContent value="email">
                    <EmailTab scope={scope} />
                  </TabsContent>
                </ScrollArea>

                <DialogFooter className="md:col-span-2 mt-2">
                  <DialogClose asChild>
                    <Button variant="ghost">Close</Button>
                  </DialogClose>
                  <Button
                    form="settings"
                    type="submit"
                    disabled={isSubmitting || isSubmitSuccessful}
                  >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <></>}
                    {isSubmitting ? 'Please wait' : isSubmitSuccessful ? 'Saved' : 'Save'}
                  </Button>
                </DialogFooter>
              </Tabs>
            </form>
          </Form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export default Settings
