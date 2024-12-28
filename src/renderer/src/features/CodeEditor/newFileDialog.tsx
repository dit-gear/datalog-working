import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import { RadioGroup, RadioGroupItem } from '@components/ui/radio-group'
import { useInitialData } from './dataContext'
import { EmailStarter } from '../../templates/EmailStarter'
import { LoadedFile } from '@shared/shared-types'
import { Plus } from 'lucide-react'
import { SidebarMenuAction } from '@components/ui/sidebar'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@components/ui/select'

interface NewFileDialogProps {
  mode: 'email' | 'pdf'
}

const FormSchema = z.object({
  filename: z
    .string()
    // eslint-disable-next-line no-useless-escape
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: 'Filename must only contain alphanumeric characters, underscores, or hyphens.'
    })
    .refine((val) => val.slice(0, -4).length >= 1, {
      message: 'Filename must be at least 1 character long'
    }),
  ext: z.enum(['tsx', 'jsx']),
  scope: z.enum(['project', 'global'])
})

const NewFileDialog = ({ mode }: NewFileDialogProps) => {
  const { initialData } = useInitialData()
  const path = { project: initialData.projectPath, global: initialData.rootPath }
  const [open, setOpen] = useState<boolean>(false)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      filename: '',
      ext: 'tsx',
      scope: 'project'
    },
    mode: 'onSubmit'
  })

  function onSubmit(values: z.infer<typeof FormSchema>): void {
    const File: LoadedFile = {
      name: values.filename,
      path: `${path[values.scope]}/templates/${mode}/${values.filename}.${values.ext}`,
      type: mode,
      scope: values.scope,
      content: EmailStarter,
      filetype: values.ext
    }
    window.editorApi
      .saveNewFile(File)
      .then((response) => {
        if (response.success) {
          console.log('File saved successfully')
          setOpen(false)
        } else {
          throw new Error(response.error)
        }
      })
      .catch((error) => {
        console.error('Failed to save file:', error)
        form.setError('filename', {
          type: 'manual',
          message: error.message
        })
      })
  }
  useEffect(() => {
    if (open) {
      setTimeout(() => form.setFocus('filename'), 0)
    }
  }, [open])

  useEffect(() => {
    if (open === false) {
      form.reset({ filename: '', scope: 'project' })
    }
  }, [form, open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuAction>
          <Plus /> <span className="sr-only">{`New ${mode} template`}</span>
        </SidebarMenuAction>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>
                New <span className={mode === 'pdf' ? 'uppercase' : 'capitalize'}>{mode}</span>{' '}
                Template
              </DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new {mode} template
              </DialogDescription>
              <DialogClose />
            </DialogHeader>
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="filename"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Filename:</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ext"
                render={({ field }) => (
                  <FormItem className="min-w-24">
                    <Select defaultValue={field.value} onValueChange={field.onChange}>
                      <FormLabel className="text-transparent">Extension</FormLabel>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder=".tsx" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key={'tsx'} value={'tsx'}>
                          {'.tsx'}
                        </SelectItem>
                        <SelectItem key={'jsx'} value={'jsx'}>
                          {'.jsx'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Scope:</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-10 space-y-1"
                      orientation="horizontal"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="project" />
                        </FormControl>
                        <FormLabel className="font-normal">This project</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="global" />
                        </FormControl>
                        <FormLabel className="font-normal">Global</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default NewFileDialog
