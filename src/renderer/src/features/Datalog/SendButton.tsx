import { Button } from '@components/ui/button'
import { SendIcon } from 'lucide-react'
import { useSelectedContext } from './SelectedContext'

const SendButton = () => {
  const { selection } = useSelectedContext()
  return (
    <Button onClick={() => window.mainApi.openSendWindow(selection)}>
      <SendIcon className="mr-2 h-4 w-4" />
      <span>Send {selection && selection?.length > 0 && `(${selection.length})`}</span>
    </Button>
  )
}

export default SendButton
