import { useWatch } from 'react-hook-form'
import { getPdfAttachments } from '@shared/utils/getAttachments'
import { useDataContext } from '../dataContext'
import { useTags, useFileName } from '../utils/useTags'

interface AttachmentsTabsProps {
  active: string
  onTabClick: (id: string, type: 'pdf') => void
}

const AttachmentsTabs = ({ active, onTabClick }: AttachmentsTabsProps) => {
  const { projectPdfs } = useDataContext()
  const attachments = useWatch({ name: 'attachments' })
  const tags = useTags()

  if (!attachments || !projectPdfs) {
    return null
  }

  const pdfAttachments = getPdfAttachments(projectPdfs, attachments)

  return (
    <>
      {pdfAttachments.map((item) => {
        const isValid = typeof item.react === 'string'
        //const name = tags ? replaceTags(item.output_name_pattern, tags) : item.output_name_pattern
        const name = useFileName(item.output_name_pattern, item.name)
        return (
          <button
            key={item.id}
            disabled={!isValid}
            onClick={isValid ? () => onTabClick(item.react!, 'pdf') : undefined}
            className={`${
              active === item.react ? 'bg-accent' : 'bg-background'
            } border-t border-l border-r rounded-t-md px-4 pb-1 text-sm ring-offset-background transition-colors hover:bg-accent`}
          >
            <span>{`${name}.pdf`}</span>
          </button>
        )
      })}
    </>
  )
}

export default AttachmentsTabs

//er border-input bg-background px-2 text-sm ring-offset-background transition-colors hover:bg-accent
