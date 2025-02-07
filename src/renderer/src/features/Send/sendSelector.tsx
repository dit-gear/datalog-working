import { useEffect, useState } from 'react'
import Send from './send'
import { Select, SelectContent, SelectItem, SelectValue } from '@components/ui/select'
import { SelectTrigger } from '@components/SelectIconTrigger'
import { useData } from './utils/useData'
import { emailType } from '@shared/projectTypes'

const SendSelector = () => {
  const { data, isLoading, isError } = useData()
  const projectEmails = data?.project.emails ?? []
  const [selectedEmail, setSelectedEmail] = useState<emailType | null>(null)

  useEffect(() => {
    if (data) {
      setSelectedEmail(data.selectedEmail)
      window.sendApi.showWindow()
    }
  }, [isLoading])

  if (isLoading || !data) return null

  if (isError) {
    window.sendApi.showWindow()
    throw new Error('Error fetching initial data')
  }

  const handleSelectChange = (value: string) => {
    if (value === 'none') {
      setSelectedEmail(null)
    } else {
      const email = projectEmails.find((email) => email.name === value)
      if (email) {
        setSelectedEmail(email)
      }
    }
  }

  return (
    <div className="min-h-[calc(100vh-36px)] border-t flex flex-col">
      <div
        className="absolute ml-20 -mt-8 overflow-visible z-20"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <Select
          value={selectedEmail === null ? 'none' : selectedEmail.name}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger>
            <span>Preset: </span>
            <span className={selectedEmail === null ? 'text-muted-foreground' : ''}>
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {projectEmails
              ?.filter((email) => email.enabled)
              .map((email, index) => (
                <SelectItem key={index} value={email.name}>
                  {email.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <Send key={selectedEmail ? selectedEmail.name : 'none'} defaults={selectedEmail} />
    </div>
  )
}

export default SendSelector
