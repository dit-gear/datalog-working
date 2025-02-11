import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@components/ui/dialog'
import { useForm } from 'react-hook-form'
import { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@components/ui/radio-group'
import { Button } from '@components/ui/button'
import { useInitialData } from './dataContext'
import { DatalogDynamicType } from '@shared/datalogTypes'
import { Textarea } from '@components/ui/textarea'
import { Form, FormItem, FormField, FormLabel, FormControl, FormMessage } from '@components/ui/form'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'

interface props {
  mockdata: mockDataType
  setMockdata: Dispatch<SetStateAction<mockDataType>>
  children: ReactNode
}

export interface mockDataType {
  message: string
  source: 'logs' | 'generated'
  datalogs: DatalogDynamicType[]
}

const mockDataFormZod = z.object({
  message: z.string().max(400),
  source: z.enum(['logs', 'generated'])
})

type mockDataFormType = z.infer<typeof mockDataFormZod>

export const NewMockdataDialog: React.FC<props> = ({ mockdata, setMockdata, children }) => {
  const { initialData, generatedDatalogs } = useInitialData()
  const { loadedDatalogs } = initialData
  const [open, setOpen] = useState<boolean>(false)

  const form = useForm<mockDataFormType>({
    defaultValues: {
      message: mockdata.message,
      source: mockdata.source
    },
    mode: 'onSubmit',
    resolver: zodResolver(mockDataFormZod)
  })

  const { handleSubmit, control } = form

  const onSubmit = (data: mockDataFormType) => {
    const datalogs = data.source === 'logs' ? loadedDatalogs : generatedDatalogs
    console.log(datalogs)
    setMockdata({
      message: data.message,
      source: data.source,
      datalogs: datalogs
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader className="mb-2">
          <DialogTitle>Mockdata</DialogTitle>
          <DialogDescription>
            Select and modify mock data in the editor to suit your testing needs.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <FormField
            control={control}
            name={`message`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-col gap-4"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="generated" />
                      </FormControl>
                      <FormLabel className="font-normal">Generated logs</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="logs" disabled={!loadedDatalogs.length} />
                      </FormControl>
                      <FormLabel className="font-normal">Logs from active project</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          <div className="mt-4 rounded-md bg-blue-950 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info aria-hidden="true" className="h-5 w-5 text-blue-200" />
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-200">
                  The editor uses the active project’s settings to create mockdata. To apply changes
                  to project settings, update them in the project settings menu and reload the
                  editor.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" onClick={handleSubmit(onSubmit)}>
              Update
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

/*

export const NewMockdataDialog: React.FC<props> = ({ children }) => {
  const { initialData } = useInitialData()
  const { projectPath, loadedDatalogs } = initialData
  const disableLogs = loadedDatalogs.length === 0
  const [open, setOpen] = useState<boolean>(false)
  const [option, setOption] = useState<options>(disableLogs ? 'newData' : 'latestLog')

  const onSubmit = async () => {
    const File: ChangedFile = {
      path: `${projectPath}/templates/mockdata/mockData.json`,
      content: generateProjectJson(initialData)
    }
    try {
      const res = await window.editorApi.saveNewFile(File)
      if (res.success) {
        setOpen(false)
        return
      } else if (res.error) console.log(res.error)
    } catch (error) {
      console.error('Failed to save file:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Mock Data</DialogTitle>
          <DialogDescription>
            Choose how you would like to generate the `mockData.json` file for your project.
          </DialogDescription>
        </DialogHeader>
        <Textarea />
        <RadioGroup
          value={option}
          onValueChange={(v) => setOption(v as options)}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-4">
            <RadioGroupItem value="latestLog" id="latestLog" disabled={disableLogs} />
            <Label
              htmlFor="latestLog"
              aria-disabled={disableLogs}
              className={disableLogs ? 'text-muted-foreground' : ''}
            >
              Use data from the latest log of the active project
            </Label>
          </div>
          <div className="flex items-center gap-4">
            <RadioGroupItem value="newData" id="newData" />
            <Label htmlFor="newData">Generate new data based on project settings</Label>
          </div>
        </RadioGroup>
        <DialogFooter>
          <Button onClick={onSubmit}>Generate file</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



*/
