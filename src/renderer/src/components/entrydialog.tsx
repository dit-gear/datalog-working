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
import Stat from './stat'
import { useState, useEffect } from 'react'
import {
  combinedType,
  CopyDestination,
  OfflineFolderType,
  metadataCsv,
  entryType,
  entrySchema
} from '@shared/shared-types'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Papa from 'papaparse'
import { timecodeToSeconds, getReels } from '../utils'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { Calendar } from '@components/ui/calendar'
import { lightFormat } from 'date-fns'
import { ProjectRootType } from '@shared/projectTypes'
import replaceTags from '../utils/formatDynamicString'
import { Pencil } from 'lucide-react'
import { useToast } from '@components/ui/use-toast'
import formatDuration from '../utils/formatDuration'

interface EntrydialogProps {
  settings: ProjectRootType
  previousEntries?: entryType[]
  setOpen: (value: boolean) => void
  refetch: () => void
}

const Entrydialog = ({
  settings,
  previousEntries,
  setOpen,
  refetch
}: EntrydialogProps): JSX.Element => {
  const [metadataPath, setMetadataPath] = useState<string>('')
  const [metadataCsv, setmetadataCsv] = useState<metadataCsv[]>([])
  const [copyDirectories, setCopyDirectories] = useState<CopyDestination[] | null>(null)
  const [offlineFolder, setOfflineFolder] = useState<OfflineFolderType | null>(null)
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false)
  const { toast } = useToast()

  function getNextDay(entries: entryType[]): number {
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
      date: new Date(),
      projectName: settings.project_name,
      unit: settings.unit
    }
    return replaceTags(settings.folder_template, tags)
  }
  // getDateBasedOnTime().toISOString().split('T')[0],
  // Folder: replaceTags(settings.folder_template, defaultDay, new Date()),
  const { register, watch, setValue, formState, handleSubmit, reset, control } = useForm({
    defaultValues: {
      Folder: defaultFolder(),
      Day: defaultDay,
      Date: new Date(),
      Unit: settings.unit ? settings.unit : '',
      Files: 0,
      Size: 0,
      Duration: 0,
      ProxySize: 0,
      Clips: [] as combinedType[]
    },
    mode: 'all',
    resolver: zodResolver(entrySchema)
  })

  const onSubmit = (data: entryType): void => {
    // eslint-disable-next-line prefer-const
    let entrytoSave: Partial<entryType> = {}
    entrytoSave.Folder = data.Folder
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
    })
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
            setmetadataCsv(filteredData)
          }
        }
      })
    }
  }

  const handleRemoveCopyDestination = (indexToRemove: number): void => {
    setCopyDirectories((currentDirectories) =>
      currentDirectories ? currentDirectories.filter((_, index) => index !== indexToRemove) : null
    )
  }

  const mergeDataIfClipsAreMissing = (
    destination: CopyDestination,
    copyDirectories: CopyDestination[]
  ): CopyDestination[] => {
    // Collect all clips from destination into a Set for easy comparison
    const destinationClips = new Set(destination.data.map((d) => d.Clip))

    // Flag to check if destination was merged into any existing copy
    let destinationMerged = false

    const updatedCopyDirectories = copyDirectories.map((copy) => {
      // Collect all clips in the current copyDirectory into a Set
      const copyClips = new Set(copy.data.map((d) => d.Clip))

      // Determine if any destination clips are missing in the current copy
      const isMissingClips = Array.from(destinationClips).some((clip) => !copyClips.has(clip))

      // Additionally check if there are any overlapping clips to prevent merging in such cases
      const hasOverlappingClips = Array.from(destinationClips).some((clip) => copyClips.has(clip))

      if (isMissingClips && !hasOverlappingClips) {
        // Merge volumes and ensure uniqueness
        const newVolumes = Array.from(new Set([...copy.volume, ...destination.volume]))

        // Merge data ensuring no duplicate clips
        const newData = [...copy.data, ...destination.data.filter((d) => !copyClips.has(d.Clip))]

        destinationMerged = true
        return { volume: newVolumes, data: newData }
      }

      return copy
    })

    // If destination was not merged due to overlap, add it as a new copyDirectory
    if (!destinationMerged) {
      updatedCopyDirectories.push(destination)
    }

    return updatedCopyDirectories
  }

  const handleAddCopyDestination = async (): Promise<void> => {
    try {
      window.api
        .findOcf()
        .then((destination) => {
          if (destination) {
            if (Array.isArray(copyDirectories)) {
              console.log('destination', destination)
              console.log('copyDirectories', copyDirectories)
              const updatedCopyDirectories = mergeDataIfClipsAreMissing(
                destination,
                copyDirectories
              )
              console.log('updatedCopyDirectories', updatedCopyDirectories)
              setCopyDirectories(updatedCopyDirectories)
            } else {
              setCopyDirectories([destination])
            }
          }
        })
        .catch((e) => console.log('Catch Error: ', e))
    } catch (error) {
      console.error('Error selecting directory:', error)
    }
  }

  const handleSetOfflineDestination = async (): Promise<void> => {
    try {
      window.api
        .getOfflineFolderDetails()
        .then((folder) => {
          if (folder) {
            setOfflineFolder(folder)
            //setTotalProxySize(Math.floor(folder.folderSize / 1000000000));
            setValue('ProxySize', Math.floor(folder.folderSize / 1000000000))
          }
        })
        .catch((e) => console.log('Catch Error: ', e))
    } catch (error) {
      console.error('Error selecting directory:', error)
    }
  }

  /*onst handleSetDocumentsFolder = async() => {
    try {
      window.electron.getDocumentsFolder().then(folder=> {
        if (folder) {
          setDocFolderPath(folder);
        }}).catch(e => console.log('Catch Error: ', e));
    } catch (error) {
      console.error('Error selecting directory:', error);
    }
  };*/

  const calculateTotalSize = (array: combinedType[]): number => {
    return Math.floor(array.reduce((total, item) => total + item.Size, 0) / 1000000000)
  }
  const calculateTotalDuration = (array: combinedType[]): number => {
    const totalSeconds = array.reduce((total, item) => total + item.Duration, 0)
    //const hours = Math.floor(totalSeconds / 3600);
    //const minutes = totalSeconds % 60;
    return totalSeconds
  }
  useEffect(() => {
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
      setValue('Files', combinedArray.length)
      setValue('Size', calculateTotalSize(combinedArray))
      setValue('Duration', calculateTotalDuration(combinedArray))
      setValue('Clips', combinedArray, { shouldValidate: true })
      //console.log('copyDirectories', copyDirectories)
      console.log('combinedArray', combinedArray)
    }
  }, [copyDirectories, metadataCsv, offlineFolder])

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
      projectName: settings.project_name
    }
    setValue('Folder', replaceTags(settings.folder_template, tags))
  }, [daywatch, datewatch, unitwatch])

  return (
    <>
      <Tabs defaultValue="name" className="">
        <DialogHeader>
          <DialogTitle>New Shooting Day</DialogTitle>
          <DialogDescription>Create a summary of the shooting day</DialogDescription>
          <div>
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat key="stats-files" label="OCF Files" value={watch('Files')} warning={true} />
                <Stat key="stats-size" label="OCF Size" value={watch('Size')} suffix="GB" />
                <Stat key="stats-mxf" label="Proxies Size" value={watch('ProxySize')} suffix="GB" />
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
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="day">Day</Label>
                  <Input
                    id="day"
                    type="number"
                    className={formState.errors.Day ? ' w-16 border-red-500' : 'w-16'}
                    {...register('Day', {
                      valueAsNumber: true,
                      max: 999,
                      min: 1
                    })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Controller
                    control={control}
                    name="Date"
                    render={({ field }) => (
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="date">Date</Label>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                          <PopoverTrigger asChild>
                            <Button id="date" variant={'outline'}>
                              {field.value ? (
                                lightFormat(field.value, 'yyyy-MM-dd')
                              ) : (
                                <p>Pick a date</p>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date), setCalendarOpen(false)
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" type="text" className="w-32" {...register('Unit')} />
                </div>
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
                {copyDirectories &&
                  copyDirectories.map((directory, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6"
                    >
                      <div className="flex w-0 flex-1 items-center">
                        {/*<PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />*/}
                        <div className="ml-4 flex min-w-0 flex-1 gap-2">
                          <span className="flex-shrink-0 text-gray-400">Copy {index + 1}: </span>
                          <span className="truncate font-medium">
                            {directory.volume.length > 1
                              ? directory.volume.join(', ')
                              : directory.volume}
                          </span>
                          <span className="flex-shrink-0 text-gray-400">
                            {`${directory.data.length} of ${watch('Files')}`}:{' '}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <a
                          href="#"
                          onClick={() => handleRemoveCopyDestination(index)}
                          className="font-medium text-indigo-400 hover:text-indigo-300"
                        >
                          Remove
                        </a>
                      </div>
                    </li>
                  ))}
                {/*<li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                  <div className="flex w-0 flex-1 items-center">
                    {/*<PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">coverletter_back_end_developer.pdf</span>
                      <span className="flex-shrink-0 text-gray-400">Verified</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <a href="#" className="font-medium text-indigo-400 hover:text-indigo-300">
                      Remove
                    </a>
                  </div>
                </li>*/}
              </ul>
              <div className="flex gap-2">
                <Button onClick={handleAddCopyDestination}>{`Add OCF Copy Directory (mhl)`}</Button>
                <Button disabled onClick={() => console.log('click')}>
                  {`Add Reference Copy (CSV)`}
                </Button>
                <Button disabled onClick={() => console.log('click')}>
                  Import from Silverstack
                </Button>
              </div>
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
              <Button onClick={() => document.getElementById('file-field')?.click()}>
                Choose CSV file
              </Button>
              <Button disabled onClick={() => console.log('click')}>
                Import from DaVinci Resolve
              </Button>
              {metadataPath}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-white">Proxies folder</dt>
            <dd className="flex mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 gap-4 items-center">
              <Button onClick={handleSetOfflineDestination}>Choose folder</Button>
              {offlineFolder?.folderPath ? offlineFolder.folderPath : null}
            </dd>
          </div>
        </TabsContent>
        <TabsContent value="clips" className="h-full">
          <ScrollArea className="h-96">
            {/* Will crash, fix: <Cliptable clips={watch('Clips')} />*/}
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
    </>
  )
}

export default Entrydialog
