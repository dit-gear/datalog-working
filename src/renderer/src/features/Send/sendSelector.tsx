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
    if (!value || value === 'none') {
      setSelectedEmail(null)
    } else {
      const email = projectEmails.find((email) => email.id === value)
      if (email) {
        setSelectedEmail(email)
      }
    }
  }

  return (
    <div className="h-dvh border-t flex flex-col">
      <div
        className="absolute ml-20 overflow-visible z-20"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <Select
          value={!selectedEmail ? 'none' : selectedEmail.id}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger>
            <span>Preset: </span>
            <span className={!selectedEmail ? 'text-muted-foreground' : ''}>
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {projectEmails
              ?.filter((email) => email.enabled)
              .map((email, index) => (
                <SelectItem key={index} value={email.id}>
                  {email.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <Send key={selectedEmail ? selectedEmail.label : 'none'} defaults={selectedEmail} />
    </div>
  )
}

export default SendSelector
