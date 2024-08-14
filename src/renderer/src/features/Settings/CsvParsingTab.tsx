import { ReactElement, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { FormField, FormItem, FormControl } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@components/ui/select'
import { Switch } from '@components/ui/switch'
import { schemaType } from './settings'
import { Control, UseFormWatch, UseFormSetValue } from 'react-hook-form'

interface CsvParsingTabProps {
  scope: 'project' | 'global'
  control: Control<schemaType>
  watch: UseFormWatch<schemaType>
  setValue: UseFormSetValue<schemaType>
}

const CsvParsingTab = ({ scope, control, watch }: CsvParsingTabProps): ReactElement => {
  const [durationTemp, setDurationTemp] = useState<string>('')
  const watchEnableParsing = watch('project_enable_parsing')

  return (
    <Card>
      <CardHeader>
        <CardTitle>CSV Parsing</CardTitle>
        <CardDescription>
          You can optionally import more metadata to merge with your clips. Enabling this feature
          will allow you to select an CSV file to import.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt className="text-sm font-medium leading-6 text-white">Enable CSV Parsing</dt>
          <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 flex flex-col gap-3">
            {scope === 'project' ? (
              <FormField
                key="project_enable_parsing"
                control={control}
                name="project_enable_parsing"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                key="global_enable_parsing"
                control={control}
                name="global_enable_parsing"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </dd>
          {watchEnableParsing && (
            <>
              <dt className="text-sm font-medium leading-6 text-white">
                <CardDescription>
                  Inspect your CSV file, assign the CSV headers to the right field. Clip name must
                  match imported clip to be parsed. You can optionally add regex to refine the
                  parsing.
                </CardDescription>
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 flex flex-col gap-3">
                <div className="divide-y divide-white/10 rounded-md border border-white/20 mb-2">
                  <div className="grid grid-cols-6 items-center py-4 pl-4 pr-5 text-sm leading-6">
                    <Label>Clip</Label>
                    <div className="col-span-5 flex space-x-2 gap-4 justify-between">
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="clipfield">Field</Label>
                        <Input id="clipfield" type="text" className="col-span-3 max-w-64" />
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor="clipregex">Regex</Label>
                          <Input id="clipregex" type="text" className="max-w-64" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-6  items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                    <Label>Duration</Label>
                    <div className="col-span-5 flex space-x-2 gap-4 justify-between">
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="durationfield">Field</Label>
                        <Input id="durationfield" type="text" className="col-span-3 max-w-64" />
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor="durationunit">Duration unit</Label>
                          <Select value={durationTemp} onValueChange={setDurationTemp}>
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
                    </div>
                    {(durationTemp === 'tc' || durationTemp === 'frames') && (
                      <>
                        <div />
                        <div className="grid col-span-5 w-full max-w-sm items-center gap-1.5 mt-4">
                          <Label htmlFor="fpsfield">FPS Field</Label>
                          <Input id="fpsfield" type="text" className="max-w-64" />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="grid grid-cols-6 items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                    <Label>FPS</Label>
                    <div className="col-span-5 flex space-x-2 gap-4 justify-between">
                      <Input type="text" className="col-span-3 max-w-64" />
                      <div className="col-span-2 flex items-center gap-2">
                        <p>Regex:</p>
                        <Input type="text" className="max-w-64" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                    <Label>Scene</Label>
                    <div className="col-span-5 flex space-x-2 gap-4 justify-between">
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="scenefield">Field</Label>
                        <Input id="scenefield" type="text" className="col-span-3 max-w-64" />
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor="sceneregex">Regex</Label>
                          <Input id="sceneregex" type="text" className="col-span-3 max-w-64" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                    <Label>Shot</Label>
                    <div className="col-span-5 flex space-x-2 gap-4 justify-between">
                      <Input type="text" className="col-span-3 max-w-64" />
                      <div className="col-span-2 flex items-center gap-2">
                        <p>Regex:</p>
                        <Input type="text" className="max-w-64" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                    <Label>Take</Label>
                    <div className="col-span-5 flex space-x-2 gap-4 justify-between">
                      <Input type="text" className="col-span-3 max-w-64" />
                      <div className="col-span-2 flex items-center gap-2">
                        <p>Regex:</p>
                        <Input type="text" className="max-w-64" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                    <Label>QC</Label>
                    <div className="col-span-5 flex space-x-2 gap-4 justify-between">
                      <Input type="text" className="col-span-3 max-w-64" />
                      <div className="col-span-2 flex items-center gap-2">
                        <p>Regex:</p>
                        <Input type="text" className="max-w-64" />
                      </div>
                    </div>
                  </div>
                </div>
              </dd>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CsvParsingTab
