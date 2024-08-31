import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form'
import { Button } from '@components/ui/button'
import { Plus } from 'lucide-react'
import { Input } from '@components/ui/input'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { ProjectType, ProjectSchemaZod } from '@shared/projectTypes'

interface NewProjectDialogProps {
  showbtn: boolean
  setActiveProject: (project: ProjectType) => void
}

const NewProjectDialog = ({ showbtn, setActiveProject }: NewProjectDialogProps): JSX.Element => {
  const [showDialog, setShowDialog] = useState<boolean>(false)
  // eslint-disable-next-line no-control-regex

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
        setShowDialog(false)
        form.reset()
      } else if (result.message) {
        form.setError('name', { message: result.message })
      } else {
        return
      }
    })
  }

  useEffect(() => {
    window.api.onNewProjectClicked((state) => {
      setShowDialog(state)
    })
  }, [])

  return (
    <Dialog open={showDialog} onOpenChange={(open) => setShowDialog(open)}>
      {showbtn ? (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </DialogTrigger>
      ) : null}
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
    </Dialog>
  )
}

export default NewProjectDialog
