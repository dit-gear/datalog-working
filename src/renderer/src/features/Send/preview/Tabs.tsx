import { useState, useCallback, useEffect } from 'react'
import EmailTab from './EmailTab'
import AttachmentsTabs from './AttachmentsTabs'
import { getReactTemplate } from '@shared/utils/getReactTemplate'
import { fetchFileContent } from '../utils/fetchFileContent'
import { useDataContext } from '../dataContext'
import { useFormContext, useWatch } from 'react-hook-form'

interface TabsProps {
  sendToWorker: (code: string, type: 'email' | 'pdf', message: string) => void
}

const Tabs = ({ sendToWorker }: TabsProps) => {
  const [active, setActive] = useState<string>('email')
  const { projectTemplates } = useDataContext()
  const { getValues } = useFormContext()

  const attatchments = useWatch({ name: 'attachments' })
  const message = useWatch({ name: 'message' })

  useEffect(() => {
    if (active !== 'email' && !attatchments.includes(active)) {
      const email = getValues('react')
      loadAndSendToWorker(email, 'email')
    }
  }, [attatchments])

  useEffect(() => {
    const handler = setTimeout(() => {
      const email = getValues('react')
      loadAndSendToWorker(email, 'email')
    }, 400) // debounce delay in ms

    return () => clearTimeout(handler)
  }, [message])

  const loadAndSendToWorker = useCallback(async (id: string, type: 'email' | 'pdf') => {
    try {
      const res = getReactTemplate(id, projectTemplates, type)
      if (!res) throw new Error('Could not find template')
      const content = await fetchFileContent(res.path)
      setActive(type === 'email' ? type : id)
      sendToWorker(content, type, getValues('message'))
    } catch (err: any) {}
  }, [])

  return (
    <div
      className="bg-dark absolute h-8 p-0 -mt-8 overflow-visible z-20 flex gap-1"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <EmailTab active={active === 'email'} onTabClick={loadAndSendToWorker} />
      <AttachmentsTabs active={active} onTabClick={loadAndSendToWorker} />
    </div>
  )
}

export default Tabs
