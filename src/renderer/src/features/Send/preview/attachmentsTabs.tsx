import { useWatch } from 'react-hook-form'
import { getPdfAttachments } from '@shared/utils/getAttachments'
import { useStringWithTags } from '../utils/useTags'
import { useData } from '../utils/useData'
import { CustomTab } from '@components/CustomTab'

interface AttachmentsTabsProps {
  active: string
  onTabClick: (id: string, reactId: string, type: 'pdf') => void
}

const AttachmentsTabs = ({ active, onTabClick }: AttachmentsTabsProps) => {
  const { data } = useData()
  const projectPdfs = data?.project.pdfs ?? []
  const attachments = useWatch({ name: 'attachments' })

  if (!attachments || !projectPdfs.length) {
    return null
  }

  const pdfAttachments = getPdfAttachments(projectPdfs, attachments)

  return (
    <>
      {pdfAttachments?.map((item) => {
        const isValid = typeof item.react === 'string'
        const name = useStringWithTags(data!, item.output_name, item.label)
        return (
          <div key={item.id}>
            <CustomTab
              variant="outline"
              size="sm"
              label={name}
              isActive={active === item.id}
              onClick={isValid ? () => onTabClick(item.id, item.react!, 'pdf') : undefined}
            />
          </div>
        )
      })}
    </>
  )
}

export default AttachmentsTabs

//er border-input bg-background px-2 text-sm ring-offset-background transition-colors hover:bg-accent

/*<button
            key={item.id}
            disabled={!isValid}
            onClick={isValid ? () => onTabClick(item.react!, 'pdf') : undefined}
            className={`${
              active === item.react ? 'bg-accent' : 'bg-background'
            } border-t border-l border-r rounded-t-md px-4 pb-1 text-sm ring-offset-background transition-colors hover:bg-accent`}
          >
            <span>{`${name}.pdf`}</span>
          </button>*/
