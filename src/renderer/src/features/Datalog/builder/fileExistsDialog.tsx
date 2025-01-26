import { useState, useEffect } from 'react'
import ConfirmDialog from '@components/ConfirmDialog'

const FileExistDialog = () => {
  const [open, setOpen] = useState<boolean>(false)
  const [file, setFile] = useState<string>('')

  useEffect(() => {
    // Listen for the overwrite confirmation request from main process
    window.sharedApi.onShowOverwriteConfirmation((filePath: string) => {
      setFile(filePath)
      setOpen(true)
    })
  }, [])

  const handleConfirm = (response: boolean) => {
    window.sharedApi.sendOverwriteResponse(response)
    setOpen(false)
    setFile('')
  }

  return (
    <ConfirmDialog
      isOpen={open}
      title="File Already Exists"
      description={`${file} already exists. Do you want to overwrite it? This action can't be undone.`}
      btnlabel="Overwrite"
      onCancel={() => handleConfirm(false)}
      onConfirm={() => handleConfirm(true)}
    />
  )
}
export default FileExistDialog
