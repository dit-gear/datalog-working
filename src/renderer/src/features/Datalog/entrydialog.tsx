import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { Input } from '@components/ui/input'
import { ScrollArea, ScrollBar } from '@components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { useState, useEffect } from 'react'
import { ClipType, datalogZod, DatalogType, DatalogDynamicZod } from '@shared/datalogTypes'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DatePicker from '../../components/DatePicker'
import { ProjectRootType } from '@shared/projectTypes'
import replaceTags, { formatDate } from '../../utils/formatDynamicString'
import { Pencil } from 'lucide-react'
import { useToast } from '@components/ui/use-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel
} from '../../components/ui/form'
import { CopyType } from './types'
import { getCopiesFromClips } from './utils/getCopiesFromClips'
import { PathType } from './types'
import { DynamicTable } from '@components/data-table/DynamicTable'
import StatsPanel from './stats/statspanel'
import { mergeDirtyValues } from './utils/merge-clips'
import { removeEmptyFields } from '@renderer/utils/form'

interface EntrydialogProps {
  project: ProjectRootType
  previousEntries?: DatalogType[]
  setOpen: (value: boolean) => void
  refetch: () => void
}

const Entrydialog = ({
  project,
  previousEntries,
  setOpen,
  refetch
}: EntrydialogProps): JSX.Element => {
  const [copies, setCopies] = useState<CopyType[]>([])

  const { toast } = useToast()

  function getNextDay(entries: DatalogType[]): number {
    let highestDay = entries[0].Day

    for (const entry of entries) {
      if (entry.Day > highestDay) {
        highestDay = entry.Day
      }
    }
    return highestDay + 1
  }
  const defaultDay =
    previousEntries && previousEntries?.length > 0 ? getNextDay(previousEntries) : 1

  const defaultFolder = (): string => {
    const tags = {
      day: defaultDay,
      projectName: project.project_name,
      unit: project.unit
    }
    return replaceTags(project.folder_template, tags)
  }

  const form = useForm({
    defaultValues: {
      Folder: defaultFolder(),
      Day: defaultDay,
      Date: formatDate(),
      Unit: project.unit ? project.unit : '',
      OCF: undefined, // {}
      Proxy: undefined, // {}
      Duration: undefined,
      Reels: [],
      Copies: [],
      Clips: []
    },
    mode: 'onSubmit',
    resolver: zodResolver(DatalogDynamicZod(project, { transformDurationToReadable: true }))
  })

  const { register, watch, setValue, formState, handleSubmit, reset, control } = form

  console.log(formState)

  const onSubmit: SubmitHandler<DatalogType> = async (data): Promise<void> => {
    console.log('unclean:', data)
    const cleanedData = removeEmptyFields(data) as DatalogType
    try {
      const res = await window.api.updateDatalog(cleanedData)
      if (res.success) {
        toast({ description: 'Data saved' })
        reset()
        refetch()
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

  const updateClips = (newClips: ClipType[], setcopies = false) => {
    const dirtyFields = form.formState.dirtyFields.Clips
    const currentClips = form.getValues().Clips

    const mergedClips = mergeDirtyValues(dirtyFields, currentClips, newClips)

    form.reset({ ...form.getValues(), Clips: mergedClips }, { keepDirty: true })
    if (setcopies) {
      setCopies(getCopiesFromClips(newClips))
    }
  }

  const handleRemoveCopy = async (paths: PathType[]): Promise<void> => {
    const fullPaths = paths.map((item) => item.full)
    try {
      const res = await window.api.removeLogPath(fullPaths)
      if (res.success) {
        updateClips(res.clips, true)
      } else {
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddCopy = async (): Promise<void> => {
    try {
      const res = await window.api.findOcf()
      if (res.success) {
        updateClips(res.clips, true)
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
      const res = await window.api.getProxies()
      if (res.success) {
        updateClips(res.clips)
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
      const res = await window.api.removeProxies()
      if (res.success) {
        updateClips(res.clips)
      } else {
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleGetCsv = async (): Promise<void> => {
    try {
      const res = await window.api.getCsvMetadata()
      if (res.success) {
        updateClips(res.clips)
      } else {
        if (res.cancelled) return
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }
  const [folderEdit, setFolderEdit] = useState<boolean>(false)

  const daywatch = watch('Day')
  const datewatch = watch('Date')
  const unitwatch = watch('Unit')

  useEffect(() => {
    const tags = {
      day: daywatch,
      date: datewatch,
      unit: unitwatch !== '' ? unitwatch : undefined,
      projectName: project.project_name
    }
    setValue('Folder', replaceTags(project.folder_template, tags))
  }, [daywatch, datewatch, unitwatch])

  return (
    <Form {...form}>
      <Tabs defaultValue="name" className="">
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
              <TabsTrigger value="paths">2. Import</TabsTrigger>
              <TabsTrigger value="clips">3. Preview</TabsTrigger>
            </TabsList>
          </div>
        </DialogHeader>
        <TabsContent value="name">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-white">Entry Naming</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
              <div className="flex gap-10 mb-10">
                <FormField
                  control={control}
                  name="Day"
                  rules={{
                    max: { value: 999, message: 'The day must be less than or equal to 999' },
                    min: { value: 1, message: 'The day must be greater than or equal to 1' },
                    required: 'Day is required' // Optional: add required validation
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day</FormLabel>
                      <FormControl>
                        <Input
                          id="day"
                          type="number"
                          min={1}
                          max={999}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          className="w-16"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="Date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-between pt-1">
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <DatePicker field={field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="Unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input id="unit" type="text" className="w-32" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="folder">Entry Name</Label>
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input
                    id="folder"
                    disabled={!folderEdit}
                    type="text"
                    className={formState.errors.Folder ? 'border-red-500' : ''}
                    {...register('Folder')}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => {
                      setFolderEdit((prev) => {
                        const newValue = !prev
                        if (newValue) {
                          setTimeout(() => {
                            document.getElementById('folder')?.focus()
                          }, 0)
                        }
                        return newValue
                      })
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                <div className="h-3">
                  <p className="text-sm">
                    {formState.errors.Day?.message || formState.errors.Folder?.message}
                  </p>
                </div>
              </div>
            </dd>
          </div>
        </TabsContent>
        <TabsContent value="paths">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-white">OCF</dt>
            <dd className="mt-2 text-sm text-white sm:col-span-2 sm:mt-0">
              <ul
                role="list"
                className="divide-y divide-white/10 rounded-md border border-white/20 mb-2"
              >
                {copies.map((copy, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6"
                  >
                    <div className="flex w-0 flex-1 items-center">
                      {/*<PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />*/}
                      <div className="ml-4 flex min-w-0 flex-1 gap-2">
                        <span className="flex-shrink-0 text-gray-400">Copy {index + 1}: </span>

                        {copy.paths.map((item, index) => (
                          <span key={index} className="truncate font-medium">
                            {item.volume}
                            <span className="text-gray-400">
                              {item.relativePath}
                              {index < copy.paths.length - 1 && ', '}
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
                        onClick={() => handleRemoveCopy(copy.paths)}
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
            <ScrollBar orientation="vertical" />
            <ScrollBar orientation="horizontal" />
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

export default Entrydialog
