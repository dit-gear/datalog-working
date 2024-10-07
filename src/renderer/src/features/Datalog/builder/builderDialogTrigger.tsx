import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog'
import { DatalogType } from '@shared/datalogTypes'
import { ProjectRootType } from '@shared/projectTypes'
import { Button } from '@components/ui/button'
import { Plus } from 'lucide-react'
import Builderdialog from './builderDialog'

interface EntrydialogProps {
  project: ProjectRootType
  previousEntries?: DatalogType[]
  refetch: () => void
}

const BuilderdialogTrigger = ({
  project,
  previousEntries,
  refetch
}: EntrydialogProps): JSX.Element => {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Shooting Day
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[80vw] h-[90vh]">
        {open && (
          <Builderdialog
            project={project}
            previousEntries={previousEntries}
            setOpen={setOpen}
            refetch={refetch}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default BuilderdialogTrigger
