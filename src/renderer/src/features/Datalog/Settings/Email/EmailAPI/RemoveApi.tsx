import { useState } from 'react'
import { Button } from '@components/ui/button'
import ConfirmDialog from '@components/ConfirmDialog'

const RemoveApiButton = () => {
  const [open, setOpen] = useState<boolean>(false)
  const handleConfirm = () => {}
  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Clear Email Config
      </Button>
      <ConfirmDialog
        isOpen={open}
        title="Delete saved Email API configs?"
        description="Do you want to delete any saved Email API configs on this computer? This action can't be undone."
        btnlabel="Delete"
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  )
}

export default RemoveApiButton
