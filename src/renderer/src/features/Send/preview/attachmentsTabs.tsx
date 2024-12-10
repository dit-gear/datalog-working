import { TabsTrigger } from '@components/ui/tabs'
import { useWatch } from 'react-hook-form'
import { getPdfAttachments } from '@shared/utils/getAttachments'
import { useDataContext } from '../dataContext'

const AttachmentsTabs = () => {
  const { projectPdfs } = useDataContext()
  const attachments = useWatch({ name: 'attachments' })

  if (!attachments || !projectPdfs) {
    return null
  }

  const pdfAttachments = getPdfAttachments(projectPdfs, attachments)

  return (
    <>
      {pdfAttachments.map((item) => (
        <TabsTrigger
          className="border-t border-l border-r rounded-t-lg px-4 pb-2"
          key={item.id}
          value={item.id}
        >
          <span className="h-4">{`${item.output_name_pattern} (pdf)`}</span>
        </TabsTrigger>
      ))}
    </>
  )
}

export default AttachmentsTabs
