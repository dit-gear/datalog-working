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
import { PDFStarter } from '@renderer/templates/PDFStarter'
import { ChangedFile } from '@shared/shared-types'
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
    .min(1)
    // eslint-disable-next-line no-useless-escape
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: 'Filename must only contain alphanumeric characters, underscores, or hyphens.'
    }),
  ext: z.enum(['tsx', 'jsx']),
  scope: z.enum(['project', 'global'])
})

const NewFileDialog = ({ mode }: NewFileDialogProps) => {
  const { initialData } = useInitialData()
  const path = { project: initialData.projectPath, global: initialData.rootPath }
  const [open, setOpen] = useState<boolean>(false)
  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      filename: '',
      ext: 'tsx',
      scope: 'project'
    },
    mode: 'onSubmit',
    resolver: zodResolver(FormSchema)
  })

  const { handleSubmit, control } = form

  const onSubmit = async (values: z.infer<typeof FormSchema>): Promise<void> => {
    console.log('onsubmit launched')
    console.log(`${path[values.scope]}/templates/${mode}/${values.filename}.${values.ext}`)
    const File: ChangedFile = {
      path: `${path[values.scope]}/templates/${mode}/${values.filename}.${values.ext}`,
      content: mode === 'email' ? EmailStarter : PDFStarter
    }
    try {
      const res = await window.editorApi.saveNewFile(File)
      if (res.success) {
        console.log('File saved successfully')
        setOpen(false)
      } else {
        throw new Error(res.error)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      console.error('Failed to save file:', error)
      form.setError('filename', {
        type: 'manual',
        message: message
      })
    }
  }
  useEffect(() => {
    if (open) {
      setTimeout(() => form.setFocus('filename'), 0)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      form.reset({ filename: '', ext: 'tsx', scope: 'project' })
    }
  }, [form.reset, open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuAction>
          <Plus /> <span className="sr-only">{`New ${mode} template`}</span>
        </SidebarMenuAction>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-sm">
        <Form {...form}>
          <form className="flex flex-col gap-4">
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
                control={control}
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
                control={control}
                name="ext"
                render={({ field }) => {
                  console.log('Current ext value:', field.value)
                  return (
                    <FormItem className="min-w-24">
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormLabel className="text-transparent">Extension</FormLabel>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tsx">.tsx</SelectItem>
                          <SelectItem value="jsx">.jsx</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>
            <FormField
              control={control}
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
                <Button variant="ghost" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleSubmit(onSubmit)}>
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
