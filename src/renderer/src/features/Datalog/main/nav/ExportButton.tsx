import { useState } from 'react'
import { useProject } from '../../hooks/useProject'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@components/ui/select'
import { Button } from '@components/ui/button'
import { useSelectedContext } from '../SelectedContext'
import { pdfType } from '@shared/projectTypes'
import { FileDown } from 'lucide-react'

const ExportButton = () => {
  const { data: project } = useProject()
  const pdfs = project?.pdfs?.filter((pdf) => pdf.enabled) ?? []
  const { selection } = useSelectedContext()
  const [open, setOpen] = useState<boolean>(false)
  const [selectedPreset, setSelectedPreset] = useState<pdfType | null>(null)

  const handleSubmit = async (): Promise<void> => {
    if (selectedPreset) {
      window.mainApi.exportPdf(selectedPreset, selection)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!selection?.length}>
          <FileDown className="h-4 w-4" />
          <span>Export PDF {selection && selection?.length > 0 && `(${selection.length})`}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select PDF to Export</DialogTitle>
          <DialogDescription hidden>Select PDF to Export</DialogDescription>
        </DialogHeader>
        {!!pdfs.length ? (
          <Select
            onValueChange={(v) => setSelectedPreset(pdfs.find((pdf) => pdf.id === v) || null)}
            defaultValue={selectedPreset?.id ?? undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {pdfs.map((pdf) => (
                <SelectItem key={pdf.id} value={pdf.id}>
                  {pdf.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          'No PDF Export Presets found. Add presets in settings to export.'
        )}
        <DialogFooter>
          <Button disabled={!selectedPreset} onClick={() => handleSubmit()}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ExportButton
