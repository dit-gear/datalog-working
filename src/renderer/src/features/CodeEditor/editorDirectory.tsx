import { TabsContent } from '@components/ui/tabs'
import { DirectoryFile } from '@shared/shared-types'
import { useLoadedFile } from './loadedFileContext'
import { getFileName } from '@renderer/utils/formatString'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator
} from '@components/ui/context-menu'

interface DirectoryDisplayProps {
  directoryContent: DirectoryFile[]
  type: 'email' | 'pdf'
}

const EditorDirectory: React.FC<DirectoryDisplayProps> = ({
  directoryContent,
  type
}: DirectoryDisplayProps) => {
  const { loadedFile, setLoadedFile } = useLoadedFile()

  const handleDelete = async (file: DirectoryFile): Promise<void> => {
    const response = await window.editorApi.deleteFile(file)
    if (response.success) {
      setLoadedFile(null)
      console.log('File deleted successfully')
    } else {
      console.error('Error deleting file:', response.error)
    }
  }

  return (
    <TabsContent value={type}>
      <ul key={type}>
        {directoryContent
          .filter((file) => file.type === type)
          .map((file) => (
            <ContextMenu key={file.path}>
              <ContextMenuTrigger asChild>
                <li
                  className={`flex justify-between items-center select-none cursor-pointer space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground aria-selected:bg-blue-950 aria-selected:ring-1  data-[state=open]:ring-1`}
                  aria-selected={loadedFile?.path === file.path}
                  onClick={() => window.editorApi.requestReadFile(file)}
                >
                  <div className="text-xs font-medium leading-none truncate">
                    {getFileName(file.path)}
                  </div>
                  <p className="line-clamp-2 text-xs leading-snug text-muted-foreground capitalize">
                    {file.scope}
                  </p>
                </li>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>Rename</ContextMenuItem>
                <ContextMenuItem>Duplicate</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => handleDelete(file)}>Delete</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
      </ul>
    </TabsContent>
  )
}

export default EditorDirectory
