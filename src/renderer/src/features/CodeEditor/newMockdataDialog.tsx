import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@components/ui/dialog'
import { ReactNode, useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@components/ui/radio-group'
import { Label } from '@components/ui/label'
import { Button } from '@components/ui/button'
import { useInitialData } from './dataContext'
import { ChangedFile } from '@shared/shared-types'
import { generateProjectJson } from './utils/generateMockData'

interface props {
  children: ReactNode
}

type options = 'latestLog' | 'newData'

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
      await window.editorApi.saveNewFile(File)
      setOpen(false)
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
