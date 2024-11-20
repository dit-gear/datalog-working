import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader
} from '@components/ui/alert-dialog'
import { Progress } from '@components/ui/progress'
import { useState, useEffect } from 'react'

const ProgressDialog = (): JSX.Element => {
  const [showProgress, setShowProgress] = useState<boolean>(false)
  const [progressBar, setProgressBar] = useState<number>(0)

  useEffect(() => {
    const deregister = window.mainApi.showProgressListener((show, progress) => {
      setShowProgress(show)
      setProgressBar(progress)
    })

    return () => {
      deregister && deregister()
    }
  }, [])

  return (
    <>
      <AlertDialog open={showProgress} onOpenChange={setShowProgress}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogDescription>Parsing mhl...</AlertDialogDescription>
            <Progress value={progressBar * 100} />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ProgressDialog
