import { useState, useEffect } from 'react'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@components/ui/sidebar'
import Group from './group'
import { TemplateDirectoryFile } from '@shared/projectTypes'
import { useInitialData } from '../dataContext'

const Aside = (): JSX.Element => {
  const { initialData } = useInitialData()
  const [files, setFiles] = useState<TemplateDirectoryFile[]>(
    initialData.activeProject.templatesDir
  )

  const handleDirectoryChanged = (_, files: TemplateDirectoryFile[]): void => {
    setFiles(files)
  }

  useEffect(() => {
    window.editorApi.onDirChanged(handleDirectoryChanged)
  }, [])

  /*const modeRef = useRef<NewTemplateDialogHandle>(null)
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
    <aside className="min-h-[calc(100vh-36px)]">
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
}*/

  return (
    <Sidebar className="min-h-[calc(100vh-36px)]">
      <SidebarHeader className="mt-8" />
      <SidebarContent className="px-2">
        <SidebarMenu>
          <Group type="email" files={files} />
          <Group type="pdf" files={files} />
          <SidebarMenuItem key="moackData.json">
            <SidebarMenuButton size="sm">
              <div className="w-4" />
              <span>mockData.json</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

export default Aside
