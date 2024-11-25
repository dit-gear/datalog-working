import { TabsTrigger } from '@components/ui/tabs'
import { useWatch } from 'react-hook-form'
import { getPdfAttachments } from '@shared/utils/project-methods'

export const AttachmentsTabs = () => {
  const attachments = useWatch({ name: 'attachments' })

  // Return the JSX structure
  return (
    <>
      {attachments.map((item: string, index: number) => (
        <TabsTrigger
          className="border-t border-l border-r rounded-t-lg px-4 pb-2"
          key={index}
          value="pdf"
        >
          {item}
        </TabsTrigger>
      ))}
    </>
  )
}
