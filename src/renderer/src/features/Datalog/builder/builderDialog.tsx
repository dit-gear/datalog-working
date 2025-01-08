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
import { useState } from 'react'
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
import { DynamicTable } from './tabs/preview/DynamicTable'
import StatsPanel from './stats/statspanel'
import { mergeDirtyValues } from '../utils/merge-clips'
import { removeEmptyFields } from '@renderer/utils/form'
import Name from './tabs/name'
import z from 'zod'

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
  const [ocfCopies, setOcfCopies] = useState<CopyType[]>(
    selected?.ocf?.clips ? formatCopiesFromClips(selected.ocf.clips) : []
  )
  const [soundCopies, setSoundCopies] = useState<CopyType[]>(
    selected?.sound?.clips ? formatCopiesFromClips(selected.sound.clips) : []
  )

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

  const omitted = datalogZod.omit({ ocf: true, proxy: true, sound: true, custom: true })
  const builderSchema = omitted.extend({
    ocfClips: OCF.shape.clips,
    ocfOverrideFiles: OCF.shape.files,
    ocfOverrideSize: OCF.shape.size,
    ocfOverrideCopies: OCF.shape.copies,
    ocfOverrideReels: OCF.shape.reels,
    ocfOverrideDuration: OCF.shape.duration,
    soundClips: Sound.shape.clips,
    soundOverrideFiles: Sound.shape.files,
    soundOverrideSize: Sound.shape.size,
    soundOverrideCopies: Sound.shape.copies,
    proxyClips: Proxy.shape.clips,
    proxyOverrideFiles: Proxy.shape.files,
    proxyOverrideSize: Proxy.shape.size,
    csvClips: z.array(z.any())
  })

  const form = useForm({
    defaultValues: {
      id: selected ? selected.id : defaultId(),
      day: selected ? selected.day : defaultDay,
      date: selected ? selected.date : formatDate(),
      unit: selected ? selected.unit : project.unit ? project.unit : '',
      ocfClips: selected?.ocf.clips ?? [],
      ocfOverrideFiles: selected?.ocf.files ?? '',
      ocfOverrideSize: selected?.ocf.size ?? '',
      ocfOverrideCopies: selected?.ocf.copies ?? [],
      ocfOverrideReels: selected?.ocf?.reels ?? [],
      ocfOverrideDuration: selected?.ocf.duration ?? [],
      soundClips: selected?.sound ?? [],
      soundOverrideFiles: selected?.sound?.files ?? '',
      soundOverrideSize: selected?.sound?.size ?? '',
      soundOverrideCopies: selected?.sound?.copies ?? [],
      proxyClips: selected?.proxy?.clips ?? [],
      proxyOverrideFiles: selected?.proxy?.files ?? '',
      proxyOverrideSize: selected?.proxy?.size ?? '',
      csvClips: selected?.custom ?? []
    },
    mode: 'onSubmit',
    resolver: zodResolver(builderSchema)
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

  const updateOcfClips = (newClips: OcfClipType[], setcopies = false) => {
    const dirtyFields = form.formState.dirtyFields.ocfClips
    const currentClips = form.getValues().ocfClips

    const mergedClips = mergeDirtyValues(dirtyFields, currentClips, newClips)
    console.log('mergedClips:', mergedClips)
    form.reset({ ...form.getValues(), ocfClips: mergedClips }, { keepDirty: true })
    if (setcopies) {
      setOcfCopies(formatCopiesFromClips(newClips))
    }
  }

  const handleRemoveCopy = async (paths: CopyBaseType[]): Promise<void> => {
    const fullPaths = paths.map((item) => item.path)
    try {
      const res = await window.mainApi.removeLogPath(fullPaths)
      if (res.success) {
        res.clips.ocf && updateOcfClips(res.clips.ocf, true)
      } else {
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddCopy = async (): Promise<void> => {
    try {
      const res = await window.mainApi.findOcf()
      if (res.success) {
        res.clips.ocf && updateOcfClips(res.clips.ocf, true)
      } else {
        if (res.cancelled) return
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleGetProxies = async (): Promise<void> => {
    try {
      const res = await window.mainApi.getProxies()
      if (res.success) {
        //updateClips(res.clips)
      } else {
        if (res.cancelled) return
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemoveProxies = async (): Promise<void> => {
    try {
      const res = await window.mainApi.removeProxies()
      if (res.success) {
        //updateClips(res.clips)
      } else {
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleGetCsv = async (): Promise<void> => {
    try {
      const res = await window.mainApi.getCsvMetadata()
      if (res.success) {
        console.log('getcsv-res:', res.clips)
        //updateClips(res.clips)
      } else {
        if (res.cancelled) return
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <Tabs defaultValue="name" className="">
        <DialogHeader>
          <DialogTitle>New Shooting Day</DialogTitle>
          <DialogDescription>Create a summary of the shooting day</DialogDescription>
          <div>
            <div className="mx-auto max-w-7xl">{/*<StatsPanel />*/}</div>
          </div>
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-3 w-[400px] mt-4">
              <TabsTrigger value="name">1. Name</TabsTrigger>
              <TabsTrigger value="paths">2. Import</TabsTrigger>
              <TabsTrigger value="clips">3. Preview</TabsTrigger>
            </TabsList>
          </div>
        </DialogHeader>
        <TabsContent value="name">
          <Name project={project} />
        </TabsContent>
        <TabsContent value="paths">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-white">OCF</dt>
            <dd className="mt-2 text-sm text-white sm:col-span-2 sm:mt-0">
              <ul
                role="list"
                className="divide-y divide-white/10 rounded-md border border-white/20 mb-2"
              >
                {ocfCopies.map((copy, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6"
                  >
                    <div className="flex w-0 flex-1 items-center">
                      {/*<PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />*/}
                      <div className="ml-4 flex min-w-0 flex-1 gap-2">
                        <span className="flex-shrink-0 text-gray-400">Copy {index + 1}: </span>

                        {copy.copies.map((item, index) => (
                          <span key={index} className="truncate font-medium">
                            {item.volume}
                            <span className="text-gray-400">
                              {item.path}
                              {index < copy.copies.length - 1 && ', '}
                            </span>
                          </span>
                        ))}

                        <span className="flex-shrink-0 text-gray-400">
                          {copy.count[0]} of {copy.count[1]} Clips
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <a
                        href="#"
                        onClick={() => handleRemoveCopy(copy.copies)}
                        className="font-medium text-indigo-400 hover:text-indigo-300"
                      >
                        Remove
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button onClick={handleAddCopy}>{`Add OCF Copy Directory (mhl)`}</Button>
              </div>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-white">Proxies folder</dt>
            <dd className="flex mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 gap-4 items-center">
              <Button onClick={handleGetProxies}>Choose folder</Button>
              <Button onClick={handleRemoveProxies} variant="outline">
                Clear
              </Button>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-white">Import Metadata</dt>
            <dd className="flex mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 gap-4 items-center">
              <Button onClick={handleGetCsv}>Select CSV file</Button>
            </dd>
          </div>
        </TabsContent>
        <TabsContent value="clips" className="h-full">
          <ScrollArea className="h-[50vh] w-[75vw] overflow-hidden" type="auto">
            <DynamicTable />
          </ScrollArea>
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
