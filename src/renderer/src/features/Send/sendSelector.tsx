import { useState } from 'react'
import Send from './send'
import { Select, SelectContent, SelectItem, SelectValue } from '@components/ui/select'
import { SelectTrigger } from '@components/SelectIconTrigger'
import { emailType, TemplateDirectoryFile } from '@shared/projectTypes'

interface SendSelectorProps {
  projectEmails: emailType[]
  projectTemplates: TemplateDirectoryFile[]
}

const SendSelector = ({ projectEmails, projectTemplates }: SendSelectorProps) => {
  const [selectedEmail, setSelectedEmail] = useState<emailType | null>(null)

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
            <span>Email Template: </span>
            <span className={selectedEmail === null ? 'text-muted-foreground' : ''}>
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {projectEmails.map((email, index) => (
              <SelectItem key={index} value={email.name}>
                {email.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Send
        key={selectedEmail ? selectedEmail.name : 'none'}
        defaults={selectedEmail}
        projectTemplates={projectTemplates}
      />
    </div>
  )
}

export default SendSelector
