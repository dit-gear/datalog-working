import { useWatch } from 'react-hook-form'
import { getPdfAttachments } from '@shared/utils/getAttachments'
import { Preview } from './Preview'
import { TabsContent } from '@components/ui/tabs'
import { useDataContext } from '../dataContext'

export const AttachmentsPreview = () => {
  const { projectPdfs } = useDataContext()
  const attachments = useWatch({ name: 'attachments' })

  if (!attachments || !projectPdfs) {
    return null
  }

  const pdfAttachments = getPdfAttachments(projectPdfs, attachments)

  return (
    <>
      {pdfAttachments.map((item) => (
        <TabsContent key={item.id} value={item.id} className="h-full w-full">
          {item.react && <Preview react={item.react} type="pdf" />}
        </TabsContent>
      ))}
    </>
  )
}
