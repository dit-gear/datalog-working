import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { ScrollArea } from '@components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { useEffect, useState } from 'react'
import {
  DatalogType,
  DatalogDynamicZod,
  CopyBaseType,
  datalogZod,
  OcfClipZod,
  OcfClipType,
  OCF,
  Sound,
  Proxy
} from '@shared/datalogTypes'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProjectRootType } from '@shared/projectTypes'
import replaceTags, { formatDate } from '../../../utils/formatDynamicString'
import { useToast } from '@components/lib/hooks/use-toast'
import { Form } from '@components/ui/form'
import { CopyType } from '@shared/datalogTypes'
import { formatCopiesFromClips } from '../../../../../shared/utils/format-copies'
import { DynamicTable } from './tabs/preview/table/DynamicTable'
import StatsPanel from './stats/statspanel'
import { mergeDirtyValues } from '../utils/merge-clips'
import { removeEmptyFields } from '@renderer/utils/form'
import Name from './tabs/name'
import Import from './tabs/import/index'
import Preview from './tabs/preview'
import z, { ZodTypeAny } from 'zod'

interface BuilderdialogProps {
  project: ProjectRootType
  previousEntries?: DatalogType[]
  selected?: DatalogType
  setOpen: (value: boolean) => void
}

const Builderdialog = ({
  project,
  previousEntries,
  selected,
  setOpen
}: BuilderdialogProps): JSX.Element => {
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

  const defaultId = (): string => {
    const tags = {
      day: defaultDay,
      projectName: project.project_name,
      unit: project.unit
    }
    return replaceTags(project.folder_template, tags)
  }

  /*
 old form
 const form = useForm({
    defaultValues: {
      id: selected ? selected.id : defaultFolder(),
      day: selected ? selected.day : defaultDay,
      date: selected ? selected.date : formatDate(),
      unit: selected ? selected.unit : project.unit ? project.unit : '',
      ocf: selected ? selected.ocf : undefined,
      proxy: selected ? selected.proxy : undefined, // {}
      duration: selected ? selected.duration : undefined,
      reels: selected ? selected.reels : [],
      copies: selected ? selected.copies : [],
      clips: selected ? selected.clips : []
    },
    mode: 'onSubmit',
    resolver: zodResolver(DatalogDynamicZod(project, { transformDurationToReadable: true }))
  })
  */

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
    id: datalogZod.shape.id,
    day: datalogZod.shape.day,
    date: datalogZod.shape.date,
    unit: datalogZod.shape.unit.nullable(),
    ocf: makeNullableExcept(OCF, ['clips']),
    sound: makeNullableExcept(Sound, ['clips']),
    proxy: makeNullableExcept(Proxy, ['clips']),
    custom: datalogZod.shape.custom
  })

  const form = useForm({
    defaultValues: {
      id: selected ? selected.id : defaultId(),
      day: selected ? selected.day : defaultDay,
      date: selected ? selected.date : formatDate(),
      unit: selected ? selected.unit : project.unit ? project.unit : '',
      ocf: {
        files: selected?.ocf.files ?? null,
        size: selected?.ocf.size ?? null,
        duration: selected?.ocf.duration ?? null,
        reels: selected?.ocf.reels ?? null,
        copies: selected?.ocf.copies ?? null,
        clips: selected?.ocf.clips ?? []
      },
      sound: {
        files: selected?.sound.files ?? null,
        size: selected?.sound.size ?? null,
        copies: selected?.sound.copies ?? null,
        clips: selected?.ocf.clips ?? []
      },
      proxy: {
        files: selected?.sound.files ?? null,
        size: selected?.sound.size ?? null,
        clips: selected?.ocf.clips ?? []
      },
      custom: selected?.custom ?? []
    },
    mode: 'onSubmit',
    resolver: zodResolver(datalogFormSchema)
  })

  const { formState, handleSubmit, reset } = form

  console.log(formState)

  const onSubmit: SubmitHandler<DatalogType> = async (data): Promise<void> => {
    console.log('unclean:', data)
    const cleanedData = removeEmptyFields(data) as DatalogType
    try {
      const res = await window.mainApi.updateDatalog(cleanedData)
      if (res.success) {
        toast({ description: 'Data saved' })
        reset()
        setOpen(false)
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
    <Form {...form}>
      <Tabs defaultValue="name" className="overflow-hidden">
        <DialogHeader>
          <DialogTitle>New Shooting Day</DialogTitle>
          <DialogDescription>Create a summary of the shooting day</DialogDescription>
          <div>
            <div className="mx-auto max-w-7xl">
              <StatsPanel />
            </div>
          </div>
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-3 w-[400px] mt-4">
              <TabsTrigger value="name">1. Name</TabsTrigger>
              <TabsTrigger value="import">2. Import</TabsTrigger>
              <TabsTrigger value="clips">3. Preview</TabsTrigger>
            </TabsList>
          </div>
        </DialogHeader>
        <TabsContent value="name">
          <Name project={project} />
        </TabsContent>
        <TabsContent value="import">
          <Import project={project} />
        </TabsContent>
        <TabsContent value="clips" className="h-full">
          <Preview />
        </TabsContent>
      </Tabs>
      <DialogFooter className="mt-auto">
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <Button
          variant="default"
          //disabled={!formState.isValid}
          onClick={() => handleSubmit(onSubmit)()}
        >
          Submit
        </Button>
      </DialogFooter>
    </Form>
  )
}

export default Builderdialog
