import { Button } from '@components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { DatalogType } from '@shared/datalogTypes'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProjectRootType } from '@shared/projectTypes'
import { formatDate } from '../../../../../shared/utils/formatDynamicString'
import { useToast } from '@components/lib/hooks/use-toast'
import { Form } from '@components/ui/form'
import StatsPanel from './stats/statspanel'
import { removeEmptyFields } from '@renderer/utils/form'
import Name from './tabs/name'
import Import from './tabs/import/index'
import Preview from './tabs/preview'
import DefaultsDialog from './defaultPaths/defaultsDialog'
import FileExistDialog from './fileExistsDialog'
import { useNavigate } from 'react-router-dom'
import { datalogFormSchema, datalogFormType } from './utils/schema'
import { getNextDay } from './utils/getNextDay'
import { getDefaultId } from './utils/getDefaultId'

interface BuilderdialogProps {
  project: ProjectRootType
  previousEntries?: DatalogType[]
  selected?: DatalogType
}

const Builder = ({ project, previousEntries, selected }: BuilderdialogProps) => {
  const { toast } = useToast()
  const navigate = useNavigate()

  const defaultDay =
    previousEntries && previousEntries?.length > 0 ? getNextDay(previousEntries) : 1

  const tags = {
    day: defaultDay,
    projectName: project.project_name,
    unit: project.unit,
    log: project.logid_template
  }

  const form = useForm({
    defaultValues: {
      id: selected ? selected.id : getDefaultId(project.logid_template, tags),
      day: selected ? selected.day : defaultDay,
      date: selected ? selected.date : formatDate(),
      unit: selected ? selected.unit : project.unit ? project.unit : '',
      ocf: {
        files: selected?.ocf?.files ?? null,
        size: selected?.ocf?.size ?? null,
        duration: selected?.ocf?.duration ?? null,
        reels: selected?.ocf?.reels ?? null,
        copies: selected?.ocf?.copies ?? null,
        clips: selected?.ocf?.clips ?? []
      },
      sound: {
        files: selected?.sound?.files ?? null,
        size: selected?.sound?.size ?? null,
        copies: selected?.sound?.copies ?? null,
        clips: selected?.sound?.clips ?? []
      },
      proxy: {
        files: selected?.proxy?.files ?? null,
        size: selected?.proxy?.size ?? null,
        clips: selected?.proxy?.clips ?? []
      },
      custom: selected?.custom ?? []
    },
    mode: 'onBlur',
    resolver: zodResolver(datalogFormSchema)
  })

  const {
    formState: { isValid },
    handleSubmit,
    reset
  } = form

  const onError = (errors) => {
    console.log('Errors:', errors)
  }

  const onSubmit: SubmitHandler<datalogFormType> = async (data): Promise<void> => {
    const cleanedData = removeEmptyFields(data) as DatalogType
    const oldDatalog = selected
    try {
      const res = await window.mainApi.updateDatalog(cleanedData, oldDatalog)
      if (res.success) {
        toast({ title: `${data.id} has been ${oldDatalog ? 'saved' : 'updated'}` })
        reset()
        navigate('/')
      } else if (res.cancelled) {
        return
      } else {
        console.error(res.error)
        toast({ title: 'Issue saving datalog', description: `${res.error}` })
      }
    } catch (error) {
      console.error(error)
      toast({ title: 'Issue saving datalog', description: 'Please try again' })
    }
  }

  return (
    <div className="relative mx-auto max-w-screen-2xl px-4">
      <Form {...form}>
        <Tabs defaultValue="name" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sticky top-0 right-0 pt-8 z-40 col-span-6 bg-background">
            <div className="mx-auto">
              <StatsPanel />
            </div>
            <div className="flex justify-center">
              <TabsList className="grid grid-cols-3 w-[400px] mt-4 bg-dark">
                <TabsTrigger
                  value="name"
                  className="hover:bg-zinc-900 data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-8 data-[state=active]:decoration-blue-400"
                >
                  1. Name
                </TabsTrigger>
                <TabsTrigger
                  value="import"
                  className="hover:bg-zinc-900 data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-8 data-[state=active]:decoration-blue-400"
                >
                  2. Import
                </TabsTrigger>
                <TabsTrigger
                  value="clips"
                  className="hover:bg-zinc-900 data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-8 data-[state=active]:decoration-blue-400"
                >
                  3. Preview
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          <TabsContent value="name" asChild tabIndex={-1}>
            <div className="lg:col-start-2 col-span-3 mb-32 ">
              <Name project={project} />
            </div>
          </TabsContent>
          <TabsContent value="import" asChild tabIndex={-1}>
            <div className="lg:col-start-2 col-span-3 mb-32">
              <Import project={project} />
            </div>
          </TabsContent>
          <TabsContent value="clips" asChild tabIndex={-1}>
            <div className="col-span-6 mb-16 flex-1 overflow-scroll rounded-lg border border-white/10 min-h-5/6">
              <Preview />
            </div>
          </TabsContent>
        </Tabs>
        <div className="fixed right-2 bottom-0 flex justify-end gap-10 px-6 py-4 rounded-tl-lg bg-zinc-950">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button variant="default" disabled={!isValid} onClick={handleSubmit(onSubmit, onError)}>
            {selected ? 'Update' : 'Submit'}
          </Button>
        </div>
        <DefaultsDialog project={project} tags={tags} />
      </Form>
      <FileExistDialog />
    </div>
  )
}

export default Builder
