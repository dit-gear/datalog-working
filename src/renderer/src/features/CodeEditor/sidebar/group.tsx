import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem
} from '@components/ui/sidebar'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator
} from '@components/ui/context-menu'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@components/ui/collapsible'
import { ChevronRightIcon } from 'lucide-react'
import { TemplateDirectoryFile } from '@shared/projectTypes'
import NewFileDialog from '../newFileDialog'

interface GroupProps {
  type: 'email' | 'pdf'
  files: TemplateDirectoryFile[]
}

const Group = ({ type, files }: GroupProps) => {
  const handleDelete = async (file: TemplateDirectoryFile): Promise<void> => {
    const response = await window.editorApi.deleteFile(file)
    if (response.success) {
      console.log('File deleted successfully')
    } else {
      console.error('Error deleting file:', response.error)
    }
  }

  return (
    <Collapsible defaultOpen className="group/collapsible" key={type}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton size="sm">
            <ChevronRightIcon className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
            <span>{type}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <NewFileDialog mode={type} />
        <CollapsibleContent>
          <SidebarMenuSub className="pr-0 mr-0">
            {files &&
              files
                .filter((file) => file.type === type)
                .map((file) => (
                  <SidebarMenuSubItem key={file.path}>
                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <SidebarMenuButton
                          className="flex justify-between"
                          key={file.path}
                          onClick={() => window.editorApi.requestReadFile(file)}
                        >
                          <span className="text-xs font-medium leading-none truncate">
                            {file.name}
                          </span>
                          <span className="line-clamp-2 text-xs leading-snug text-muted-foreground capitalize">
                            {file.scope}
                          </span>
                        </SidebarMenuButton>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem>Rename</ContextMenuItem>
                        <ContextMenuItem>Duplicate</ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => handleDelete(file)}>Delete</ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  </SidebarMenuSubItem>
                ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export default Group
