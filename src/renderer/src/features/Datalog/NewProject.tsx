import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProjectSchemaZod } from '@shared/projectTypes'
import { useNavigate } from 'react-router-dom'

const NewProjectPage = () => {
  const navigate = useNavigate()
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
    window.mainApi.createNewProject(values.name).then((result) => {
      if (result.success && result.project) {
        console.log('Project created successfully')
        navigate('/')
      } else {
        form.setError('name', { message: result.error })
        return
      }
    })
  }

  return (
    <div className="flex min-h-[calc(100vh-36px)] justify-center items-center">
      <Card className="w-full max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Create a New Project</CardTitle>
              <CardDescription>Enter the name of the project</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="my-4">
                    <FormLabel className="sr-only">Project Name</FormLabel>
                    <FormControl>
                      <Input {...field} autoFocus />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button size="sm" type="submit" className="w-full">
                Create
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}

export default NewProjectPage
