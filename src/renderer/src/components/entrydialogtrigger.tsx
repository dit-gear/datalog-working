import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog'
import { ProjectSettings, entryType } from '@types'
import { Button } from '@components/ui/button'
import { Plus } from 'lucide-react'
import Entrydialog from './entrydialog'

interface EntrydialogProps {
  settings: ProjectSettings
  previousEntries?: entryType[]
  refetch: () => void
}

const Entrydialogtrigger = ({
  settings,
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
          <Entrydialog
            settings={settings}
            previousEntries={previousEntries}
            setOpen={setOpen}
            refetch={refetch}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default Entrydialogtrigger
