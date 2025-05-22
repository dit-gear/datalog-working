import { useState } from 'react'
import { Button } from '@components/ui/button'
import ConfirmDialog from '@components/ConfirmDialog'
import { useFormContext } from 'react-hook-form'

const RemoveApiButton = () => {
  const [open, setOpen] = useState<boolean>(false)
  const { setValue } = useFormContext()
  const handleConfirm = async () => {
    const res = await window.sharedApi.removeEmailApiConfig()
    if (res.success) {
      setValue('email_api_exist', false)
    }
  }
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
