import { Button } from '@components/ui/button'
import { useState, useEffect } from 'react'
import { SponsorMessageContentType } from '@shared/shared-types'
import { useOnlineStatus } from '@renderer/utils/OnlineStatus'

interface MessageBoxProps {
  fullWidth?: boolean
}

const MessageBox = ({ fullWidth }: MessageBoxProps) => {
  const [message, setMessage] = useState<SponsorMessageContentType>(null)

  const isOnline = useOnlineStatus()

  const handleClick = async (link: string) => {
    window.sharedApi.openExternal(link)
    window.sharedApi.recordMessageClick(isOnline)
  }

  const loadSponsorMessage = async () => {
    const res = await window.sharedApi.handleSponsoredMessage(isOnline, !!message)
    setMessage(res)
  }

  useEffect(() => {
    loadSponsorMessage()
  }, [isOnline])

  if (!message) return null

  return (
    <div
      className={`fixed bottom-0 left-0 ${fullWidth && 'right-3 bg-zinc-950 flex justify-center'} p-4 border-t`}
    >
      <div>
        <p className="text-xs text-blue-400">{message.header}</p>
        <span className="text-sm">
          {message.sponsor ? `${message.sponsor}: ${message.text}` : message.text}
          {message.cta && (
            <Button
              variant="link"
              className="h-auto py-0 pl-1 text-xs font-normal text-blue-400 underline"
              onClick={() => handleClick(message.cta!.link)}
            >
              {message.cta.label}
            </Button>
          )}
        </span>
      </div>
    </div>
  )
}

export default MessageBox
// Message from today's sponsor:
