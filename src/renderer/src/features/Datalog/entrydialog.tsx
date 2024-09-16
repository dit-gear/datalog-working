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
import { ScrollArea } from '@components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import Stat from '../../components/stat'
import { useState, useEffect } from 'react'
import { OfflineFolderType } from '@shared/shared-types'
import { ClipType, datalogZod, DatalogType } from '@shared/datalogTypes'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Papa from 'papaparse'
import { timecodeToSeconds, getReels } from '../../utils'
import DatePicker from '../../components/DatePicker'
import { ProjectRootType } from '@shared/projectTypes'
import replaceTags, { formatDate } from '../../utils/formatDynamicString'
import { Pencil } from 'lucide-react'
import { useToast } from '@components/ui/use-toast'
import formatDuration from '../../utils/formatDuration'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormDescription,
  FormMessage,
  FormLabel
} from '../../components/ui/form'
import { CopyType } from './types'
import { getCopiesFromClips } from './utils/getCopiesFromClips'
import { PathType } from './types'

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
  const [metadataPath, setMetadataPath] = useState<string>('')
  //const [metadataCsv, setmetadataCsv] = useState<metadataCsv[]>([])
  const [offlineFolder, setOfflineFolder] = useState<OfflineFolderType | null>(null)

  const [clips, setClips] = useState<ClipType[]>([])
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
  // getDateBasedOnTime().toISOString().split('T')[0],
  // Folder: replaceTags(project.folder_template, defaultDay, new Date()),
  const form = useForm({
    defaultValues: {
      Folder: defaultFolder(),
      Day: defaultDay,
      Date: formatDate(),
      Unit: project.unit ? project.unit : '',
      OCF: { Files: 0, Size: 0 },
      Proxy: { Files: 0, Size: 0 },
      Duration: 0,
      Clips: []
    },
    mode: 'all',
    resolver: zodResolver(datalogZod)
  })
  console.log(formatDate())

  const { register, watch, setValue, formState, handleSubmit, reset, control } = form

  const onSubmit = (data: DatalogType): void => {
    //let entrytoSave: Partial<entryType> = {}
    console.log(data)
    /*entrytoSave.Folder = data.Folder
    entrytoSave.Day = data.Day
    entrytoSave.Date = data.Date
    if (data.Unit !== '') entrytoSave.Unit = data.Unit
    entrytoSave.Files = data.Files
    entrytoSave.Size = data.Size
    entrytoSave.Duration = data.Duration
    entrytoSave.ProxySize = data.ProxySize
    entrytoSave.Clips = data.Clips
    window.api.saveEntry(entrytoSave).then((res) => {
      if (res.success) {
        toast({ description: 'Data saved' })
        reset()
        refetch()
        setOpen(false)
      } else {
        toast({ description: 'There was an issue saving the entry' })
      }
    })*/
  }

  /*useEffect(() => {
    if (formState.errors) {
      console.log(formState.errors)
    }
  }, [formState])*/

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files
    if (files && files[0]) {
      const file = files[0]
      setMetadataPath(file?.name)
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        beforeFirstChunk: function (chunk) {
          const rows = chunk.split('\n')
          const headers = rows[0].split(',').map((header) => header.replace(/[\s-]+/g, ''))
          rows[0] = headers.join(',')
          return rows.join('\n')
        },
        complete: function (results) {
          if (results.data) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filteredData = results.data.map((item: any) => ({
              Clip: item['ReelName'],
              Duration: timecodeToSeconds(item['DurationTC'], 25),
              Scene: item['Scene'],
              Shot: item['Shot'],
              Take: item['Take'],
              QC: item['ReviewedByReviewersNotes']
            }))
            //setmetadataCsv(filteredData)
          }
        }
      })
    }
  }

  const handleRemoveCopy = async (paths: PathType[]): Promise<void> => {
    const fullPaths = paths.map((item) => item.full)
    console.log(fullPaths)
    try {
      const res = await window.api.removeLogPath(fullPaths)
      if (res.success) {
        console.log(res)
        setClips(res.clips)
        setCopies(getCopiesFromClips(res.clips))
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
        setClips(res.clips)
        setCopies(getCopiesFromClips(res.clips))
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
        setClips(res.clips)
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
        setClips(res.clips)
      } else {
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }
  /*
  const calculateTotalSize = (array: combinedType[]): number => {
    return Math.floor(array.reduce((total, item) => total + item.Size, 0) / 1000000000)
  }
  const calculateTotalDuration = (array: combinedType[]): number => {
    const totalSeconds = array.reduce((total, item) => total + item.Duration, 0)
    return totalSeconds
  }*/
  /*useEffect(() => {
    if (copyDirectories) {
      const combinedMap = new Map<string, combinedType>()

      copyDirectories.forEach((copy) => {
        copy.data.forEach((item) => {
          const existingEntry = combinedMap.get(item.Clip)
          const resolve = metadataCsv.find((resolveItem) => resolveItem.Clip === item.Clip)
          const proxy = offlineFolder?.files.find((file) => file.filename === item.Clip)

          if (existingEntry) {
            if (!existingEntry.Volumes.includes(item.Volume)) {
              existingEntry.Volumes.push(item.Volume)
            }
          } else {
            // eslint-disable-next-line prefer-const
            let newEntry: combinedType = {
              ...item,
              Duration: item.Duration || resolve?.Duration || 0,
              Proxy: proxy ? true : false,
              Volumes: [item.Volume]
            }
            if (item.Scene || resolve?.Scene) newEntry.Scene = item.Scene || resolve?.Scene
            if (resolve?.Shot) newEntry.Shot = resolve?.Shot
            if (item.Take || resolve?.Take) newEntry.Take = item.Take || resolve?.Take
            if (resolve?.QC) newEntry.QC = resolve?.QC

            combinedMap.set(item.Clip, newEntry)
          }
        })
      })

      const combinedArray = Array.from(combinedMap.values())
      //setValue('Files', combinedArray.length)
      //setValue('Size', calculateTotalSize(combinedArray))
      setValue('Duration', calculateTotalDuration(combinedArray))
      //setValue('Clips', combinedArray, { shouldValidate: true })
    }
  }, [copyDirectories, metadataCsv, offlineFolder])*/

  //const [date, setDate] = useState<Date | undefined>(getDateBasedOnTime())
  const [folderEdit, setFolderEdit] = useState<boolean>(false)

  const daywatch = watch('Day')
  const datewatch = watch('Date')
  const unitwatch = watch('Unit')
  const clipswatch = watch('Clips')

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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/*<Stat key="stats-files" label="OCF Files" value={watch('Files')} warning={true} />
                <Stat key="stats-size" label="OCF Size" value={watch('Size')} suffix="GB" />
                <Stat key="stats-mxf" label="Proxies Size" value={watch('ProxySize')} suffix="GB" />*/}
                <Stat
                  key="stats-duration"
                  label="Duration"
                  duration={formatDuration(watch('Duration'))}
                />
                <Stat
                  key="stats-reels"
                  label="Reels"
                  value={getReels(clipswatch).join(', ')}
                  small
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-3 w-[400px] mt-4">
              <TabsTrigger value="name">Name</TabsTrigger>
              <TabsTrigger value="paths">Paths</TabsTrigger>
              <TabsTrigger value="clips">Clips</TabsTrigger>
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
                {/*<Input
                    id="day"
                    type="number"
                    className={formState.errors.Day ? ' w-16 border-red-500' : 'w-16'}
                    {...register('Day', {
                      valueAsNumber: true,
                      max: 999,
                      min: 1
                    })}
                  />*/}
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
                {copies
                  ? copies.map((copy, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6"
                      >
                        <div className="flex w-0 flex-1 items-center">
                          {/*<PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />*/}
                          <div className="ml-4 flex min-w-0 flex-1 gap-2">
                            <span className="flex-shrink-0 text-gray-400">Copy {index + 1}: </span>

                            {copy.paths.map((item, index) => (
                              <span className="truncate font-medium">
                                {item.volume}
                                <span className="text-gray-400">
                                  {item.relativePath}
                                  {index < copy.paths.length - 1 && ', '}
                                </span>
                              </span>
                            ))}

                            <span className="flex-shrink-0 text-gray-400">
                              {/*`${directory.data.length} of ${watch('Files')}`*/} -{' '}
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
                    ))
                  : project.default_ocf_paths && project.default_ocf_paths.length > 0
                    ? project.default_ocf_paths.map((directory, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6"
                        >
                          <div className="flex w-0 flex-1 items-center">
                            {/*<PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />*/}
                            <div className="ml-4 flex min-w-0 flex-1 gap-2">
                              <span className="flex-shrink-0 text-gray-400">
                                Copy {index + 1}:{' '}
                              </span>
                              <span className="truncate font-medium text-gray-400">
                                {directory}
                              </span>
                              <span className="flex-shrink-0 text-gray-400">
                                {/*`${directory.data.length} of ${watch('Files')}`*/}:{' '}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <a
                              href="#"
                              onClick={() => console.log('click')}
                              className="font-medium text-indigo-400 hover:text-indigo-300"
                            >
                              Remove
                            </a>
                          </div>
                        </li>
                      ))
                    : null}
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
              {offlineFolder?.folderPath ? offlineFolder.folderPath : null}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-white">Import Metadata</dt>
            <dd className="flex mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 gap-4 items-center">
              <input
                id="file-field"
                className="hidden"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
              <Button
                onClick={() => document.getElementById('file-field')?.click()}
                disabled={!project.additional_parsing}
              >
                Choose CSV file
              </Button>
              {metadataPath}
            </dd>
          </div>
        </TabsContent>
        <TabsContent value="clips" className="h-full">
          <ScrollArea className="h-96">
            {/* Will crash, fix: <Cliptable clips={watch('Clips')} />*/}
            {JSON.stringify(clips)}
          </ScrollArea>
        </TabsContent>
      </Tabs>
      <DialogFooter className="mt-auto">
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <Button
          variant="default"
          disabled={!formState.isValid}
          onClick={() => handleSubmit(onSubmit)()}
        >
          Submit
        </Button>
      </DialogFooter>
    </Form>
  )
}

export default Entrydialog
