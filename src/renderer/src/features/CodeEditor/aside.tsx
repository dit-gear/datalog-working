import { useRef } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs'
import NewTemplateDialog, { NewTemplateDialogHandle } from './newTemplateDialog'
import EditorDirectory from './editorDirectory'
import useInitialDir from './useInitialDir'

const Aside = (): JSX.Element => {
  const modeRef = useRef<NewTemplateDialogHandle>(null)
  const FileDirectory = (): JSX.Element => {
    const { dir, loading } = useInitialDir()

    if (loading) {
      return <p>Loading...</p>
    }
    return (
      <>
        <EditorDirectory directoryContent={dir} type="email" />
        <EditorDirectory directoryContent={dir} type="pdf" />
      </>
    )
  }

  const handleTabChange = (value: string): void => {
    if (modeRef.current) {
      modeRef.current.setMode(value as 'email' | 'pdf')
    }
  }

  return (
    <aside>
      <Tabs
        className="min-w-[200px] flex flex-col mt-2 ml-2 gap-2"
        defaultValue="email"
        onValueChange={handleTabChange}
      >
        <div className="flex ml-3 items-center justify-between">
          <TabsList className="-ml-2">
            <TabsTrigger value="email">Emails</TabsTrigger>
            <TabsTrigger value="pdf">PDFs</TabsTrigger>
          </TabsList>
          <NewTemplateDialog ref={modeRef} />
        </div>
        <FileDirectory />
      </Tabs>
    </aside>
  )
}

export default Aside
