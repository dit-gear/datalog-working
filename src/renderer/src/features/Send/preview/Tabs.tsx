import { useState, useCallback, useEffect } from 'react'
import EmailTab from './EmailTab'
import AttachmentsTabs from './AttachmentsTabs'
import { getReactTemplate } from '@shared/utils/getReactTemplate'
import { fetchFileContent } from '../utils/fetchFileContent'
import { useData } from '../utils/useData'
import { useFormContext, useWatch } from 'react-hook-form'

interface TabsProps {
  sendToWorker: (code: string, type: 'email' | 'pdf', message: string) => void
}

const Tabs = ({ sendToWorker }: TabsProps) => {
  const [active, setActive] = useState<string>('email')
  const { data } = useData()
  const projectTemplates = data?.project.templatesDir ?? []
  const { getValues } = useFormContext()

  const attatchments = useWatch({ name: 'attachments' })
  const message = useWatch({ name: 'message' })

  useEffect(() => {
    if (active !== 'email' && !attatchments.includes(active)) {
      const email = getValues('react')
      if (email) {
        loadAndSendToWorker(email, 'email')
      } else {
        const def = projectTemplates?.filter((item) => item.type === 'email')[0]
        loadAndSendToWorker(def.name, 'email')
      }
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
    if (id === active) return
    try {
      const res = getReactTemplate(id, projectTemplates, type)
      if (!res) throw new Error('Could not find template')
      const content = await fetchFileContent(res.path)
      setActive(type === 'email' ? type : id)
      sendToWorker(content, type, getValues('message'))
    } catch (err: any) {}
  }, [])

  return (
    <div className="flex">
      <div
        className="flex mt-2 pb-2 z-40 gap-2 overflow-x-scroll overflow-y-visible sm-scroll"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <EmailTab active={active === 'email'} onTabClick={loadAndSendToWorker} />
        <AttachmentsTabs active={active} onTabClick={loadAndSendToWorker} />
      </div>
    </div>
  )
}

export default Tabs
