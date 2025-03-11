import { useState, useRef, useEffect, useCallback } from 'react'
import Editor, { EditorHandle } from './editor'
import { FileQuestion } from 'lucide-react'
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@components/ui/resizable'
import { Button } from '@components/ui/button'
import { DatabaseIcon, SettingsIcon, Files, FileCheck } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@components/ui/dropdown-menu'
import Preview from '../../components/Preview'
import { CustomTab } from '@components/CustomTab'
import { LoadedFile } from '@shared/shared-types'
import { handleApiResponse } from '@renderer/utils/handleApiResponse'
import { NewMockdataDialog, mockDataType } from './newMockdataDialog'
import { useInitialData } from './dataContext'
import { ToggleGroup, ToggleGroupItem } from '@components/ui/toggle-group'

const EditorWrapper = () => {
  const [isLoading, setLoading] = useState<boolean>(true)
  const [loadedFiles, setLoadedFiles] = useState<LoadedFile[]>([])
  const [pendingFile, setPendingFile] = useState<string | null>(null)

  const [activePath, setActivePath] = useState<string | null>(null)
  const [dirtyPaths, setDirtyPaths] = useState<string[]>([])

  const { initialData, generatedDatalogs } = useInitialData()

  const [mockdata, setMockdata] = useState<mockDataType>({
    message: 'Hello world!',
    source: initialData.loadedDatalogs.length ? 'logs' : 'generated',
    datalogs: initialData.loadedDatalogs.length ? initialData.loadedDatalogs : generatedDatalogs
  })
  const [selection, setSelection] = useState<'single' | 'multi'>('single')
  const [formatOnSave, setFormatOnSave] = useState<boolean>(true)
  const [autoCloseTags, setAutoCloseTags] = useState<boolean>(true)

  // A ref to call imperatively: editorRef.current.openFile(file)
  const editorRef = useRef<EditorHandle | null>(null)

  const handleDirty = useCallback((path: string, isDirty: boolean) => {
    setDirtyPaths((prev) => {
      if (isDirty) {
        // Mark it dirty if not already
        if (!prev.includes(path)) return [...prev, path]
        return prev
      } else {
        // Remove from dirtyPaths if it’s currently in there
        return prev.filter((p) => p !== path)
      }
    })
  }, [])

  const resetDirty = useCallback(() => setDirtyPaths([]), [])

  const handleTabClick = (filePath: string) => {
    if (editorRef.current) {
      setActivePath(filePath)
      const file = loadedFiles.find((f) => f.path === filePath)
      if (file) editorRef.current.openFile(file)
    } else {
      setLoading(true)
      setPendingFile(filePath)
    }
  }

  const handleCloseTab = (file: LoadedFile) => {
    const remainingFiles = loadedFiles.filter((f) => f.path !== file.path)
    setLoadedFiles(remainingFiles)
    if (dirtyPaths.includes(file.path)) {
      setDirtyPaths(dirtyPaths.filter((path) => path !== file.path))
    }
    const nextFile = remainingFiles[0]
    if (nextFile) {
      setActivePath(nextFile.path)
      editorRef.current?.openFile(nextFile)
    } else {
      setActivePath(null)
      setLoading(true)
    }
    editorRef.current?.removeFile(file)
  }

  useEffect(() => {
    window.editorApi.onResponseReadFile((response) => {
      handleApiResponse(response, (newFile: LoadedFile) => {
        setLoadedFiles((prev) => {
          // If not found, add it:
          const existingIndex = prev.findIndex((f) => f.path === newFile.path)
          if (existingIndex >= 0) return prev
          return [...prev, newFile]
        })
        // Then immediately:
        setPendingFile(newFile.path)
      })
    })
  }, [])

  useEffect(() => {
    if (!pendingFile || isLoading) return
    const file = loadedFiles.find((f) => f.path === pendingFile)
    if (!file) return
    editorRef?.current?.openFile(file)
    setActivePath(pendingFile)
    setPendingFile(null)
  }, [pendingFile, isLoading, loadedFiles])

  if (loadedFiles.length === 0) {
    return (
      <div className="h-dvh border-l w-full flex flex-col gap-2 justify-center items-center">
        <FileQuestion size={32} />
        <span>No loaded file</span>
      </div>
    )
  }

  const selectedFile =
    activePath !== null ? loadedFiles.find((f) => f.path === activePath) : loadedFiles[0]

  // If user has never clicked a tab, choose the first file by default

  return (
    <ResizablePanelGroup direction="horizontal" className="w-full border-l">
      <ResizablePanel className="flex flex-col">
        <div className="flex items-center justify-between mr-2">
          <div
            className="flex p-2 z-40 gap-2 overflow-x-scroll overflow-y-visible sm-scroll"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            {loadedFiles.map((file) => {
              const isActive = file.path === (selectedFile?.path ?? '')
              const isDirty = dirtyPaths.includes(file.path)
              return (
                <CustomTab
                  key={file.path}
                  variant="outline"
                  isDirty={isDirty}
                  isActive={isActive}
                  size="sm"
                  label={file.name}
                  onClick={() => handleTabClick(file.path)}
                  {...(isActive && { action: { onClick: () => handleCloseTab(file) } })}
                />
              )
            })}
          </div>

          <div className="flex gap-2">
            <NewMockdataDialog mockdata={mockdata} setMockdata={setMockdata}>
              <Button
                size="sm"
                variant="outline"
                className="rounded z-40"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              >
                <DatabaseIcon className="h-4 w-4" />
              </Button>
            </NewMockdataDialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded z-40"
                  style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem checked={formatOnSave} onCheckedChange={setFormatOnSave}>
                  Format on Save
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={autoCloseTags}
                  onCheckedChange={setAutoCloseTags}
                >
                  Autoclosing tags
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Editor
          ref={editorRef}
          onDirty={handleDirty}
          resetDirty={resetDirty}
          onEditorReady={() => setLoading(false)}
          data={[mockdata, selection]}
          options={[formatOnSave, autoCloseTags]}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel className="flex flex-col m-2 gap-2">
        <div className="relative flex items-center w-full">
          <Button
            size="sm"
            variant="outline"
            className="z-40 rounded text-xs"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            Docs
          </Button>
          <div
            className="absolute left-1/2 transform -translate-x-1/2 z-40"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              className="gap-0 h-4 w-4"
              value={selection}
              onValueChange={(v) => v && setSelection(v as 'single' | 'multi')}
            >
              <ToggleGroupItem
                value="single"
                aria-label="Toggle single log selection"
                className="z-40 rounded-r-none border-r-0"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              >
                <FileCheck className="pointer-events-none" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="multi"
                aria-label="Toggle multiple log selection"
                className="z-40 rounded-l-none border-l-0"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              >
                <Files className="pointer-events-none" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        <Preview />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default EditorWrapper
