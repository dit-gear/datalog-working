import { PreviewContainer } from './PreviewContainer'
import { Tabs, TabsList } from '@components/ui/tabs'
import EmailTab from './emailTab'
import EmailPreview from './emailPreview'
import AttachmentsTabs from './attachmentsTabs'
import { AttachmentsPreview } from './attachmentsPreview'

export const Previews = () => {
  return (
    <Tabs defaultValue="email" className="overflow-visible h-full">
      <TabsList
        className="bg-dark absolute h-8 p-0 -mt-10 overflow-visible z-20 flex gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <EmailTab />
        <AttachmentsTabs />
      </TabsList>
      <PreviewContainer>
        <EmailPreview />
        <AttachmentsPreview />
      </PreviewContainer>
    </Tabs>
  )
}
