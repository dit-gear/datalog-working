import { Button } from '@components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { DatalogType, datalogZod, OCF, Sound, Proxy } from '@shared/datalogTypes'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProjectRootType } from '@shared/projectTypes'
import replaceTags, { formatDate } from '../../../utils/formatDynamicString'
import { useToast } from '@components/lib/hooks/use-toast'
import { Form } from '@components/ui/form'
import StatsPanel from './stats/statspanel'
import { removeEmptyFields } from '@renderer/utils/form'
import Name from './tabs/name'
import Import from './tabs/import/index'
import Preview from './tabs/preview'
import z from 'zod'
import DefaultsDialog from './defaultsDialog'
import FileExistDialog from './fileExistsDialog'

interface BuilderdialogProps {
  project: ProjectRootType
  previousEntries?: DatalogType[]
  selected?: DatalogType
  setOpen: (value: boolean) => void
}

const Builderdialog = ({ project, previousEntries, selected, setOpen }: BuilderdialogProps) => {
  const { toast } = useToast()

  function getNextDay(logs: DatalogType[]): number {
    let highestDay = logs[0].day

    for (const log of logs) {
      if (log.day > highestDay) {
        highestDay = log.day
      }
    }
    return highestDay + 1
  }
  const defaultDay =
    previousEntries && previousEntries?.length > 0 ? getNextDay(previousEntries) : 1

  const tags = {
    day: defaultDay,
    projectName: project.project_name,
    unit: project.unit,
    log: project.logid_template
  }

  const defaultId = (): string => {
    return replaceTags(project.logid_template, tags)
  }

  function makeNullableExcept<T extends z.ZodRawShape>(
    schema: z.ZodObject<T>,
    keysToExclude: (keyof T)[]
  ) {
    const newShape = Object.fromEntries(
      Object.entries(schema.shape).map(([key, propSchema]) => [
        key,
        keysToExclude.includes(key as keyof T) ? propSchema : propSchema.nullable()
      ])
    )
    return z.object(newShape)
  }

  const datalogFormSchema = z.object({
    id: z.string().min(1).max(50),
    day: z.coerce
      .number({
        required_error: 'Day is required',
        invalid_type_error: 'Day is required'
      })
      .int()
      .gte(1, { message: 'Day must be greater than or equal to 1' })
      .lte(999, { message: 'Day must be below 999' }),
    date: datalogZod.shape.date,
    unit: datalogZod.shape.unit.nullable(),
    ocf: makeNullableExcept(OCF, ['clips']),
    sound: makeNullableExcept(Sound, ['clips']),
    proxy: makeNullableExcept(Proxy, ['clips']),
    custom: datalogZod.shape.custom
  })
  type datalogFormType = z.infer<typeof datalogFormSchema>

  const form = useForm({
    defaultValues: {
      id: selected ? selected.id : defaultId(),
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
    const isNew = !selected
    try {
      const res = await window.mainApi.updateDatalog(cleanedData, isNew)
      if (res.success) {
        toast({ description: 'Data saved' })
        reset()
        setOpen(false)
      } else if (res.cancelled) {
        return
      } else {
        console.error(res.error)
        toast({ description: `There was an issue saving the entry: ${res.error}` })
      }
    } catch (error) {
      console.error(error)
      toast({ description: 'There was an issue saving the entry' })
    }
  }

  return (
    <div className="relative mx-auto max-w-screen-2xl px-4">
      <Form {...form}>
        <Tabs defaultValue="name" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="overflow-hidden col-span-6">
            <div className="mx-auto">
              <StatsPanel />
            </div>
            <div className="flex justify-center">
              <TabsList className="grid grid-cols-3 w-[400px] mt-4">
                <TabsTrigger value="name">1. Name</TabsTrigger>
                <TabsTrigger value="import">2. Import</TabsTrigger>
                <TabsTrigger value="clips">3. Preview</TabsTrigger>
              </TabsList>
            </div>
          </div>
          <TabsContent value="name" asChild className="col-span-3">
            <div className="lg:col-start-2 col-span-3">
              <Name project={project} />
            </div>
          </TabsContent>
          <TabsContent value="import" asChild>
            <div className="lg:col-start-2 col-span-3">
              <Import project={project} />
            </div>
          </TabsContent>
          <TabsContent value="clips" className="h-full" asChild>
            <div className="col-span-6">
              <Preview />
            </div>
          </TabsContent>
        </Tabs>
        <div className="fixed left-0 right-0 bottom-0 w-full flex justify-end gap-10 px-6 py-4">
          <Button variant="ghost">Cancel</Button>
          <Button variant="default" disabled={!isValid} onClick={handleSubmit(onSubmit, onError)}>
            {selected ? 'Update' : 'Submit'}
          </Button>
        </div>
        <DefaultsDialog project={project} tags={tags} disabled={!!selected} />
      </Form>
      <FileExistDialog />
    </div>
  )
}

export default Builderdialog

/*<div className="sm:max-w-[100vw] h-[100vh]">
      <Form {...form}>
        <Tabs defaultValue="name" className="overflow-scroll">
          <div className="overflow-hidden">
            <div className="mx-auto ">
              <StatsPanel />
            </div>
            <div className="flex justify-center">
              <TabsList className="grid grid-cols-3 w-[400px] mt-4">
                <TabsTrigger value="name">1. Name</TabsTrigger>
                <TabsTrigger value="import">2. Import</TabsTrigger>
                <TabsTrigger value="clips">3. Preview</TabsTrigger>
              </TabsList>
            </div>
          </div>
          <div className="w-[80vw] ml-auto mr-auto mt-4 px-16 py-8 rounded-lg ">
            <TabsContent value="name" asChild>
              <Name project={project} />
            </TabsContent>
            <TabsContent value="import" asChild>
              <Import project={project} />
            </TabsContent>
            <TabsContent value="clips" className="h-full" asChild>
              <Preview />
            </TabsContent>
          </div>
        </Tabs>
        <div className="mt-auto pt-2 border-t">
          <Button variant="ghost">Cancel</Button>
          <Button variant="default" disabled={!isValid} onClick={handleSubmit(onSubmit, onError)}>
            {selected ? 'Update' : 'Submit'}
          </Button>
        </div>
        <DefaultsDialog project={project} tags={tags} disabled={!!selected} />
      </Form>
      <FileExistDialog />
    </div> */
