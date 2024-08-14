import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FolderCog } from 'lucide-react'
import { ProjectSettings } from '@types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'

import { Pencil } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@components/ui/select'
import { Switch } from '@components/ui/switch'
import { ScrollArea } from '@components/ui/scroll-area'

const schema = z.object({
  projectName: z.string().min(1).max(80),
  nameTemplate: z.string().min(1).max(80),
  unit: z.string().optional(),
  default_ocf_paths: z.array(z.string()).optional(),
  default_proxies_path: z.string().optional()
})

interface SettingsDialogProps {
  defaultSettings: ProjectSettings
}

const Settingsdialog = ({ defaultSettings }: SettingsDialogProps): JSX.Element => {
  const [pathEdit, setPathEdit] = useState(false)
  const {
    register,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      projectName: defaultSettings.project_name,
      nameTemplate: defaultSettings.folder_template,
      unit: defaultSettings.unit,
      default_proxies_path: defaultSettings.default_proxies_path,
      metadata_duration: defaultSettings.metadata_duration,
      metadata_fps: defaultSettings.metadata_fps,
      metadata_clip: defaultSettings.metadata_clip,
      metadata_scene: defaultSettings.metadata_scene,
      metadata_shot: defaultSettings.metadata_shot,
      metadata_take: defaultSettings.metadata_take,
      metadata_qc: defaultSettings.metadata_qc
    },
    mode: 'onChange',
    resolver: zodResolver(schema)
  })

  const handleAddProxiesPath = async (): Promise<void> => {
    try {
      window.api.getFolderPath().then((folderPath) => {
        console.log(folderPath)
        setValue('default_proxies_path', folderPath)
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="secondary" size="icon">
          <FolderCog className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[80vw] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>{`Configure your preferences. Global settings are applied to all projects. Project scoped settings have priority over global scoped. When sharing a project you want most settings stored in the projects folder.`}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="project">
          <TabsList className="grid grid-cols-2 mt-4">
            <TabsTrigger value="project">This Project</TabsTrigger>
            <TabsTrigger value="global">Global</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-3/6">
            <dl className="divide-y divide-white/10">
              <TabsContent value="project">
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-white">Project Name</dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
                    <Input type="text" className="w-64" {...register('projectName')} />
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-white">
                    Shooting day File/Foldername Template
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
                    <Input type="text" className="w-64" {...register('nameTemplate')} />
                    <div className="flex items-center">
                      <p>{`Tip: Use`}&nbsp;</p>
                      <Button variant="link" className="p-0">
                        tags
                      </Button>
                      <p>&nbsp;{`for dynamic content.`}</p>
                    </div>
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-white">Unit</dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
                    <Input
                      type="text"
                      placeholder="optional"
                      className="w-64"
                      {...register('unit')}
                    />
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-white">Default OCF paths</dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 flex flex-col gap-3">
                    <ul
                      role="list"
                      className="divide-y divide-white/10 rounded-md border border-white/20 mb-2"
                    >
                      <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                        <div className="flex w-0 flex-1 items-center">
                          <div className="ml-4 flex min-w-0 flex-1 gap-2 items-center">
                            <span className="flex-shrink-0 text-gray-400">Path {1}: </span>
                            {/*<span className="truncate font-medium">path</span>*/}
                            <Input
                              id="ocfPath"
                              type="text"
                              className="block w-full bg-zinc-950 border-0 py-1.5 hover:text-white focus:text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0 focus-visible:shadow-none sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex items-center">
                          <Button variant="ghost" size="sm">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-indigo-400 hover:text-indigo-300"
                          >
                            Remove
                          </Button>
                          {/*<a href="#" className="font-medium text-indigo-400 hover:text-indigo-300">
                            Remove
                          </a>*/}
                        </div>
                      </li>
                    </ul>
                    <div className="flex items-center space-x-2">
                      <Button variant="secondary">Add Path</Button>
                    </div>
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-white">Default Proxies Path</dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 flex justify-between">
                    <Input
                      id="proxiesPath"
                      type="text"
                      className="block w-full bg-zinc-950 border-0 py-1.5 hover:text-white focus:text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0 focus-visible:shadow-none sm:text-sm sm:leading-6"
                      {...register('default_proxies_path')}
                    />
                    <Button
                      variant="link"
                      onClick={() => {
                        setTimeout(() => {
                          document.getElementById('proxiesPath')?.focus()
                        }, 1)
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="secondary" onClick={handleAddProxiesPath}>
                      Add Path
                    </Button>
                    <div className="ml-4 flex-shrink-0">
                      <a href="#" className="font-medium text-indigo-400 hover:text-indigo-300">
                        Remove
                      </a>
                    </div>
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-white">Enable CSV Parsing</dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 flex flex-col gap-3">
                    <Switch />
                    <div className="divide-y divide-white/10 rounded-md border border-white/20 mb-2">
                      <div className="grid grid-cols-6 items-center py-4 pl-4 pr-5 text-sm leading-6">
                        <Label>Clip</Label>
                        <div className="col-span-5 flex space-x-2 gap-4">
                          <Input type="text" className="w-64" />
                          <div className="flex items-center gap-2">
                            <p>Regex:</p>
                            <Input type="text" className="w-64" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-6  items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                        <Label>Duration</Label>
                        <div className="col-span-5 flex space-x-2 gap-4">
                          <Input type="text" className="w-64" />
                          <Select>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="ms">Milliseconds</SelectItem>
                                <SelectItem value="s">Seconds</SelectItem>
                                <SelectItem value="tc">TC</SelectItem>
                                <SelectItem value="frames">Frames</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-6 items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                        <Label>FPS</Label>
                        <div className="col-span-5 flex space-x-2 gap-4">
                          <Input type="text" className="w-64" />
                          <div className="flex items-center gap-2">
                            <p>Regex:</p>
                            <Input type="text" className="w-64" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-6 items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                        <Label>Scene</Label>
                        <div className="col-span-5 flex space-x-2 gap-4">
                          <Input type="text" className="w-64" />
                        </div>
                      </div>
                      <div className="grid grid-cols-6 items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                        <Label>Shot</Label>
                        <Input type="text" className="w-64" />
                      </div>
                      <div className="grid grid-cols-6 items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                        <Label>Take</Label>
                        <Input type="text" className="w-64" />
                      </div>
                      <div className="grid grid-cols-6 items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                        <Label>QC</Label>
                        <div className="col-span-5 flex space-x-2 gap-4">
                          <Input type="text" className="w-64" />
                          <div className="flex items-center gap-2">
                            <p>Regex:</p>
                            <Input type="text" className="w-64" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-white">Email API</dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 flex flex-col gap-3">
                    <div className="divide-y divide-white/10 rounded-md border border-white/20 mb-2">
                      <div className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                        <Input type="text" className="w-64" />
                      </div>
                    </div>
                  </dd>
                </div>
              </TabsContent>

              {/*<TabsContent value="global">
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-white">Global Settings</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
                  <p>{`Global settings are applied to all projects.`}</p>
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-white">
                  Shooting day File/Foldername Template
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
                  <Input
                    type="text"
                    className='block w-full bg-zinc-950 rounded-md border-0 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"'
                     {...register('unit')}
                  />
                  <div className="flex items-center">
                    <p>{`Tip: Use`}&nbsp;</p>
                    <Button variant="link" className="p-0">
                      tags
                    </Button>
                    <p>&nbsp;{`for dynamic content.`}</p>
                  </div>
                </dd>
              </div>
            </TabsContent>*/}
            </dl>
          </ScrollArea>
        </Tabs>
        <DialogFooter>
          <Button>Cancel</Button>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default Settingsdialog
