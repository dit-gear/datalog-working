import { useState, useEffect } from 'react'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarRail
} from '@components/ui/sidebar'
import Group from './group'
import { TemplateDirectoryFile } from '@shared/projectTypes'
import { useInitialData } from '../dataContext'

const Aside = () => {
  const { initialData } = useInitialData()
  const [files, setFiles] = useState<TemplateDirectoryFile[]>(
    initialData.activeProject.templatesDir ?? []
  )

  const handleDirectoryChanged = (files: TemplateDirectoryFile[]): void => {
    setFiles(files)
  }

  useEffect(() => {
    window.editorApi.onDirChanged(handleDirectoryChanged)
  }, [])

  return (
    <Sidebar className="min-h-[calc(100vh-36px)]" collapsible="offcanvas">
      <SidebarHeader className="mt-8" />
      <SidebarContent className="px-2">
        <SidebarMenu>
          <Group type="email" files={files} />
          <Group type="pdf" files={files} />
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

export default Aside
