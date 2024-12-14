import { useEffect, useState, forwardRef, useImperativeHandle } from 'react'
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
import useInitialDir from './useInitialDir'
import { EmailStarter } from '../../templates/EmailStarter'
import { LoadedFile } from '@shared/shared-types'
import { getFileExtension } from '@renderer/utils/formatString'

export interface NewTemplateDialogHandle {
  setMode: React.Dispatch<React.SetStateAction<'email' | 'pdf'>>
}

const FormSchema = z.object({
  filename: z
    .string()
    // eslint-disable-next-line no-useless-escape
    .regex(/^[a-zA-Z0-9_\-]+\.(jsx|tsx)$/i, {
      message:
        'Filename must only contain alphanumeric characters, underscores, or hyphens, and must end with .jsx or .tsx'
    })
    .refine((val) => val.slice(0, -4).length >= 1, {
      message: 'Filename must be at least 1 character long'
    }),
  scope: z.enum(['project', 'global'])
})

const NewTemplateDialog = forwardRef<NewTemplateDialogHandle>((_, ref) => {
  const { loading, path } = useInitialDir()
  const [mode, setMode] = useState<'email' | 'pdf'>('email')
  const [open, setOpen] = useState<boolean>(false)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      filename: '',
      scope: 'project'
    },
    mode: 'onBlur'
  })

  function onSubmit(values: z.infer<typeof FormSchema>): void {
    const fileType = (getFileExtension(values.filename) as 'jsx' | 'tsx') || 'jsx'

    const File: LoadedFile = {
      path: `${path[values.scope]}/templates/${mode}/${values.filename}`,
      type: mode,
      scope: values.scope,
      content: EmailStarter,
      filetype: fileType,
      isNewFile: true
    }
    window.editorApi
      .saveFile(File)
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
    if (open === false) {
      form.reset({ filename: '', scope: 'project' })
    }
  }, [form, open])

  useImperativeHandle(ref, () => ({
    setMode
  }))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" disabled={loading}>
          +
        </Button>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
            <FormField
              control={form.control}
              name="filename"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filename</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      className="flex flex-col space-y-1"
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
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                disabled={!form.formState.isValid}
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
})

NewTemplateDialog.displayName = 'NewTemplateDialog'

export default NewTemplateDialog
