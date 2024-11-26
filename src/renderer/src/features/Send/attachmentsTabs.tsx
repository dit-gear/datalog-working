import { TabsTrigger } from '@components/ui/tabs'
import { useWatch } from 'react-hook-form'
import { getPdfAttachments } from '../../utils/getAttachments'
import { pdfType } from '@shared/projectTypes'

interface AttachmentTabsProps {
  pdfs: pdfType[]
}

export const AttachmentsTabs = ({ pdfs }: AttachmentTabsProps) => {
  const attachments = useWatch({ name: 'attachments' })

  if (!attachments || !pdfs) {
    return null
  }

  const pdfAttachments = getPdfAttachments(pdfs, attachments)

  return (
    <>
      {pdfAttachments.map((item) => (
        <TabsTrigger
          className="border-t border-l border-r rounded-t-lg px-4 pb-2"
          key={item.id}
          value={item.id}
        >
          {`${item.output_name_pattern} (pdf)`}
        </TabsTrigger>
      ))}
    </>
  )
}
