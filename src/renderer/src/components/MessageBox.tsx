import { Button } from '@components/ui/button'
import { useState, useEffect } from 'react'
import { SponsorMessageSchema, SponsorMessageContentType } from '@shared/shared-types'
import { useOnlineStatus } from '@renderer/utils/OnlineStatus'

interface MessageBoxProps {
  fullWidth?: boolean
}

const MessageBox = ({ fullWidth }: MessageBoxProps) => {
  const [message, setMessage] = useState<SponsorMessageContentType>(null)

  const isOnline = useOnlineStatus()

  const handleClick = (link: string) => {
    window.sharedApi.openExternal(link)
  }

  // Add this above your return statement
  const loadSponsorMessage = async () => {
    try {
      // Skip loading ads in development
      if (import.meta.env.DEV) return

      const data = await window.sharedApi.getAd()

      if (!isOnline && data.adCache) {
        window.sharedApi.incrementViews(data.adCache.slotId)
        setMessage(data.adCache.content)
        return
      }

      console.log(import.meta.env.VITE_WORKER_URL)
      const response = await fetch(import.meta.env.VITE_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: data.sessionId,
          slotId: data.adCache?.slotId ?? null,
          cachedViews: data.cachedViews
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(`${response.status}: ${err.error}`)
      }

      const raw = await response.json()
      if (raw === null && data.adCache) {
        setMessage(data.adCache.content)
        return
      }

      const messageObj = JSON.parse(raw)
      const result = SponsorMessageSchema.safeParse(messageObj)

      if (!result.success) {
        throw new Error(result.error.toString())
      }
      console.log('before update ad')
      window.sharedApi.updateAd(result.data)
      setMessage(result.data.content)
    } catch (error) {
      console.error('Failed to load sponsor message:', error)
    }
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
