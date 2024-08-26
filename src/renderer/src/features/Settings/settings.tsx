import { useState } from 'react'
import { Button } from '@components/ui/button'
import { useForm, FormProvider } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@components/ui/form'
import { emailZodObj, emailApiZodObj } from './Email/types'
import { ProjectSettings } from '@types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from '@components/ui/dialog'
import GeneralTab from './GeneralTab'
import PathsTab from './PathsTab'
import ParsingTab from './Parsing/ParsingTab'
import EmailTab from './Email/EmailTab'

const fieldType = z.enum(['string', 'array', 'object', 'duration'])
export type fieldType = z.infer<typeof fieldType>

const options = z
  .object({
    type: fieldType,
    regex: z.string().optional(),
    unit: z.enum(['ms', 's', 'tc', 'frames']).optional(),
    fps: z.string().max(80).optional()
  })
  .optional()

const subfields = z.array(z.object({ name: z.string().min(1).max(80) })).optional()
const additionalParsing = z.object({
  clip: z.object({ field: z.string().min(1).max(80), regex: z.string().max(60).optional() }),
  fields: z
    .array(
      z
        .object({
          name: z.string().min(1).max(80),
          field: z.string().min(1).max(80),
          subfields: subfields,
          options: options
        })
        .superRefine((data, ctx) => {
          const { type } = data.options || {}
          if (type === 'object' && (!data.subfields || data.subfields.length === 0)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'At least one subfield is required when type is "object"',
              path: ['subfields']
            })
          }
          if (type === 'duration') {
            const unit = data.options?.unit
            if (!unit) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Unit is required when type is "duration"',
                path: ['options', 'unit']
              })
            }
            const fps = data.options?.fps
            if (unit === 'tc' || (unit === 'frames' && (!fps || fps.length < 1))) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'FPS is required when using "Timecode" or "Frames"',
                path: ['options', 'fps']
              })
            }
          }

          if (data.subfields) {
            const seenSubfieldNames = new Set<string>()
            data.subfields.forEach((subfield, subfieldIndex) => {
              if (seenSubfieldNames.has(subfield.name)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: 'Key must be unique',
                  path: ['subfields', subfieldIndex, 'name']
                })
              } else {
                seenSubfieldNames.add(subfield.name)
              }
            })
          }
        })
    )
    .superRefine((fields, ctx) => {
      const reservedNames = ['clip', 'duration']
      const seenNames = new Set<string>(reservedNames)

      fields.forEach((field, index) => {
        if (seenNames.has(field.name)) {
          const message = reservedNames.includes(field.name.toLowerCase())
            ? `"${field.name}" is reserved and cannot be used.`
            : 'Key must be unique'
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: message,
            path: [index, 'name']
          })
        } else {
          seenNames.add(field.name)
        }
      })
    })
    .optional()
})
export type additionalParsing = z.infer<typeof additionalParsing>

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
  project_parse_camera_metadata: z.boolean(),
  global_parse_camera_metadata: z.boolean(),
  project_enable_parsing: z.boolean(),
  global_enable_parsing: z.boolean(),
  project_additional_parsing: additionalParsing.optional(),
  global_additional_parsing: additionalParsing.optional(),
  project_emails: z.array(emailZodObj).optional(),
  global_emails: z.array(emailZodObj).optional(),
  new_email_api: emailApiZodObj.optional()
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
      project_parse_camera_metadata: true,
      global_parse_camera_metadata: true,
      project_enable_parsing: false,
      global_enable_parsing: false,
      project_additional_parsing: { clip: { field: '', regex: '' }, fields: [] },
      global_additional_parsing: { clip: { field: '', regex: '' }, fields: [] },
      project_emails: [],
      global_emails: []
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
                <PathsTab
                  scope={scope}
                  control={control}
                  watch={watch}
                  setValue={setValue}
                  register={register}
                />
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
