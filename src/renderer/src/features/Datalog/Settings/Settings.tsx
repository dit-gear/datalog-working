import { useState, useEffect } from 'react'
import { Button } from '@components/ui/button'
import { Loader2 } from 'lucide-react'
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@components/ui/form'
import { removeEmptyFields, removePrefixFields } from '@renderer/utils/form'
import { ProjectSettingsType, TemplateDirectoryFile } from '@shared/projectTypes'
import { formSchemaType, formSchema, Scope } from './types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import GeneralTab from './General/GeneralTab'
import PathsTab from './Paths/PathsTab'
import ParsingTab from './Parsing/ParsingTab'
import EmailTab from './Email/EmailTab'
import PdfTab from './PDF/PdfTab'
import { useNavigate } from 'react-router-dom'

interface SettingsDialogProps {
  defaults: ProjectSettingsType
  templates: TemplateDirectoryFile[]
}

const Settings: React.FC<SettingsDialogProps> = ({ defaults, templates }) => {
  const navigate = useNavigate()
  const [scope, setScope] = useState<Scope>('project')

  useEffect(() => {
    reset(defaultValues(defaults))
  }, [defaults])

  const defaultValues = (defaults: ProjectSettingsType) => ({
    project_project_name: defaults.project?.project_name ?? '',
    project_logid_template: defaults.project?.logid_template ?? '',
    project_unit: defaults.project?.unit ?? '',
    project_default_ocf_paths: defaults.project?.default_ocf_paths ?? [],
    project_default_sound_paths: defaults.project.default_sound_paths ?? [],
    project_default_proxy_path: defaults.project?.default_proxy_path ?? '',
    project_custom_fields: defaults.project?.custom_fields ?? undefined,
    project_emails: defaults.project?.emails ?? [],
    project_email_api: undefined,
    project_pdfs: defaults.project?.pdfs ?? [],
    global_logid_template: defaults.global?.logid_template ?? '',
    global_unit: defaults.global?.unit ?? '',
    global_default_ocf_paths: defaults.global?.default_ocf_paths ?? [],
    global_default_sound_paths: defaults.global?.default_sound_paths ?? [],
    global_default_proxy_path: defaults.global?.default_proxy_path ?? '',
    global_custom_fields: defaults.global?.custom_fields ?? undefined,
    global_emails: defaults.global?.emails ?? [],
    global_email_api: undefined,
    global_pdfs: defaults.global?.pdfs ?? [],
    project_enable_parsing: !!defaults.project?.custom_fields,
    global_enable_parsing: !!defaults.global?.custom_fields
  })

  const form = useForm<formSchemaType>({
    defaultValues: defaultValues(defaults),
    mode: 'all',
    resolver: zodResolver(formSchema)
  })
  const {
    handleSubmit,
    formState: { isSubmitting, isSubmitSuccessful, errors },
    reset
  } = form

  console.log(errors)

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
      const result = await window.mainApi.updateProject({ update_settings, update_email_api })
      if (result.success) {
        //setProject(result.project)
        console.log('project should be set with:', result.project)
        navigate('/')
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="relative">
      <FormProvider {...form}>
        <Form {...form}>
          <form id="settings" onSubmit={handleSubmit(onSubmit)}>
            <Tabs
              className="mx-auto w-[90vw] gap-2 container grid md:grid-cols-[220px_minmax(0,1fr)]"
              defaultValue="general"
              orientation="vertical"
            >
              <div className="h-full">
                <nav className="w-full sticky z-30 top-8">
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
                      Metadata Fields
                    </TabsTrigger>
                    <TabsTrigger className="w-full justify-start" value="email">
                      Email
                    </TabsTrigger>
                    <TabsTrigger className="w-full justify-start" value="pdf">
                      PDF
                    </TabsTrigger>
                  </TabsList>
                </nav>
              </div>
              <div className="mb-20">
                <TabsContent value="general" tabIndex={-1}>
                  <GeneralTab scope={scope} />
                </TabsContent>
                <TabsContent value="paths" tabIndex={-1}>
                  <PathsTab scope={scope} />
                </TabsContent>
                <TabsContent value="parsing" className="mt-0 pt-2" tabIndex={-1}>
                  <ParsingTab scope={scope} />
                </TabsContent>
                <TabsContent value="email" tabIndex={-1}>
                  <EmailTab scope={scope} templates={templates} />
                </TabsContent>
                <TabsContent value="pdf" tabIndex={-1}>
                  <PdfTab scope={scope} templates={templates} />
                </TabsContent>
              </div>
              <div className="fixed right-2 bottom-0  bg-background flex justify-end rounded-tl-lg gap-10 px-6 py-4">
                <Button variant="ghost" type="button" onClick={() => navigate('/')}>
                  Cancel
                </Button>
                <Button form="settings" type="submit" disabled={isSubmitting || isSubmitSuccessful}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <></>}
                  {isSubmitting ? 'Please wait' : isSubmitSuccessful ? 'Saved' : 'Save'}
                </Button>
              </div>
            </Tabs>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}

export default Settings

// w-[100vw] h-[100vh] max-w-[100vw] max-h-[100vh] bg-black/40 backdrop-blur-sm
