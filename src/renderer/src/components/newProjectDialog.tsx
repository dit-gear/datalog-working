import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, Dispatch, SetStateAction } from 'react'
import { ProjectType, ProjectSchemaZod } from '@shared/projectTypes'

interface NewProjectDialogProps {
  setActiveProject: (project: ProjectType) => void
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const NewProjectDialog = ({
  setActiveProject,
  open,
  setOpen
}: NewProjectDialogProps): JSX.Element => {
  const projectSchema = z.object({
    name: ProjectSchemaZod.shape.project_name
  })

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: ''
    },
    mode: 'onSubmit'
  })

  function onSubmit(values: z.infer<typeof projectSchema>): void {
    window.api.createNewProject(values.name).then((result) => {
      if (result.success && result.project) {
        console.log('Project created successfully')
        setActiveProject(result.project)
        setOpen(false)
      } else if (result.message) {
        form.setError('name', { message: result.message })
      } else {
        return
      }
    })
  }

  useEffect(() => {
    if (!open) {
      form.reset()
    }
  }, [])

  return (
    <DialogContent className="sm:max-w-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create a New Project</DialogTitle>
            <DialogDescription>Enter the name of the project</DialogDescription>
          </DialogHeader>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="my-4">
                <FormLabel className="sr-only">Project Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button size="sm" type="submit">
              Create
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}

export default NewProjectDialog
