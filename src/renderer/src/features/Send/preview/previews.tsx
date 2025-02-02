import Preview from '@components/Preview'
import { Header } from './Header'

export const Previews = () => {
  return (
    <div className="overflow-visible h-full">
      <Header />

      <Preview />
    </div>
  )
}

/*
    <Tabs defaultValue="email" className="overflow-visible h-full">
      <TabsList
        className="bg-dark absolute h-8 p-0 -mt-10 overflow-visible z-20 flex gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <EmailTab />
        <AttachmentsTabs />
      </TabsList>
      <PreviewContainer>
        <Preview />
      </PreviewContainer>
    </Tabs>
*/
