import { forwardRef, useImperativeHandle, useEffect, useRef, useCallback } from 'react'
import * as monaco from 'monaco-editor'
import { Monaco, Editor as MonacoEditor, OnMount, loader } from '@monaco-editor/react'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
//import { createHighlighter } from 'shiki'
//import { shikiToMonaco } from '@shikijs/monaco'
import { LoadedFile, ChangedFile } from '@shared/shared-types'
import { loadTypeDefinitions } from './utils/typeDefinitions'
import { useInitialData } from './dataContext'
import { formatter } from '@renderer/utils/prettierFormatter'
import { getLatestDatalog, getLatestTwoDatalogs } from '@shared/utils/getLatestDatalog'
import { mockDataType } from './newMockdataDialog'
import useDebouncedCallback from '@renderer/utils/useDebouncedCallback'
import { DataObjectType } from '@shared/datalogClass'

//type Monaco = typeof monaco

/*const highlighter = await createHighlighter({
  themes: ['dark-plus', 'aurora-x'],
  langs: ['typescript-ext']
})*/

export type EditorHandle = {
  openFile: (file: LoadedFile) => void
  removeFile: (file: LoadedFile) => void
  openFind: () => void
  getActiveModelCode: () => string
  saveFiles: () => void
}

interface EditorProps {
  onDirty: (path: string, dirty: boolean) => void
  resetDirty: () => void
  onEditorReady: () => void
  data: [mockdata: mockDataType, selection: 'single' | 'multi']
  options: [formatOnSave: boolean, autoCloseTags: boolean]
}

interface FileTrackingInfo {
  path: string
  type: 'email' | 'pdf'
  modelUri: monaco.Uri
  lastSavedVersionId: number
}

const fileTrackers: Map<string, FileTrackingInfo> = new Map()

const Editor = forwardRef<EditorHandle, EditorProps>((props, ref) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof monaco | null>(null)

  const {
    onEditorReady,
    onDirty,
    resetDirty,
    data: [mockdata, selection],
    options: [formatOnSave, autoCloseTags]
  } = props

  const autoCloseTagsRef = useRef(autoCloseTags)
  const formatOnSaveRef = useRef(formatOnSave)

  const selectionRef = useRef(selection)
  const mockDataRef = useRef(mockdata)

  const { initialData } = useInitialData()
  const data = { project: initialData.activeProject }

  const previewWorkerRef = useRef<Worker | null>(null)

  useEffect(() => {
    autoCloseTagsRef.current = autoCloseTags
  }, [autoCloseTags])

  useEffect(() => {
    formatOnSaveRef.current = formatOnSave
  }, [formatOnSave])

  useEffect(() => {
    selectionRef.current = selection
    const model = editorRef.current?.getModel()
    if (!model) {
      return
    }
    const file = fileTrackers.get(model.uri.toString())
    if (!file) {
      return
    }
    debouncedSendMessageToWorker(model, file)
  }, [selection])

  useEffect(() => {
    mockDataRef.current = mockdata
    const model = editorRef.current?.getModel()
    if (!model) {
      return
    }
    const file = fileTrackers.get(model.uri.toString())
    if (!file) {
      return
    }
    debouncedSendMessageToWorker(model, file)
  }, [mockdata])

  useEffect(() => {
    const handleGlobalSave = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault() // Prevent browser's default save dialog
        handleSave() // Call your save function
      }
    }

    window.addEventListener('keydown', handleGlobalSave)

    return () => {
      window.removeEventListener('keydown', handleGlobalSave)
    }
  }, [])

  useEffect(() => {
    const previewWorker = new Worker(new URL('@workers/preview-worker.ts', import.meta.url), {
      type: 'module'
    })
    previewWorkerRef.current = previewWorker

    previewWorker.onmessage = (e): void => {
      const msg = e.data
      if (msg.type === 'read-files-base64') {
        const { id, base, paths } = msg
        // Fetch base64 for asset files from main via IPC
        window.sharedApi.readBase64Files(base, paths).then((data) => {
          previewWorker.postMessage({
            type: 'read-files-base64-response',
            id,
            data
          })
        })
        return
      }
      const { type, code, error } = e.data
      if (code) {
        const previewEvent = new CustomEvent('preview-update', { detail: { type, code } })
        window.dispatchEvent(previewEvent)
      } else if (error) {
        console.log('error from worker')
        const errorEvent = new CustomEvent('preview-error', { detail: error })
        window.dispatchEvent(errorEvent)
      }
    }

    return () => {
      previewWorker.terminate()
    }
  }, [])

  const sendMessageToWorker = useCallback(
    (model: monaco.editor.ITextModel, file: FileTrackingInfo): void => {
      try {
        if (!previewWorkerRef.current) throw new Error('Worker not initialized')
        if (!data) throw new Error('No project data available')

        const dataObject: DataObjectType = {
          project: data.project,
          message: mockDataRef.current.message,
          datalog_selection:
            selectionRef.current === 'single'
              ? getLatestDatalog(mockDataRef.current.datalogs, data.project)
              : getLatestTwoDatalogs(mockDataRef.current.datalogs),
          datalog_all: mockDataRef.current.datalogs
        }
        const request = {
          path: file.path,
          code: model.getValue(),
          type: file.type,
          dataObject
        }
        previewWorkerRef.current.postMessage(request)
      } catch (error) {
        console.error('Error in sendMessageToWorker: ', error)
      }
    },
    [data]
  )

  const checkDirty = useCallback(
    (model: monaco.editor.ITextModel, file: FileTrackingInfo): void => {
      const currentVersion = model.getAlternativeVersionId()
      const isDirty = currentVersion !== file.lastSavedVersionId
      onDirty(file.path, isDirty)
    },
    []
  )

  const debouncedSendMessageToWorker = useDebouncedCallback(sendMessageToWorker, 300)
  const debouncedCheckDirty = useDebouncedCallback(checkDirty, 300)

  const handleContentChange = useCallback(
    (
      model: monaco.editor.ITextModel,
      file: FileTrackingInfo,
      event: monaco.editor.IModelContentChangedEvent
    ) => {
      console.log(model, file, event)
      if (autoCloseTagsRef.current && event.changes.length > 0) {
        const text = event.changes[0].text
        if (text === '>') {
          insertClosingTag(model)
        }
      }

      debouncedSendMessageToWorker(model, file)
      debouncedCheckDirty(model, file)
    },
    [autoCloseTags, debouncedSendMessageToWorker, debouncedCheckDirty]
  )

  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return new jsonWorker()
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker()
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker()
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker()
      }
      return new editorWorker()
    }
  }

  const viewStatesRef = useRef<Record<string, monaco.editor.ICodeEditorViewState | null>>({})

  console.log('editor rendered')

  useImperativeHandle(ref, () => ({
    openFile(file: LoadedFile) {
      if (!monacoRef.current || !editorRef.current) return

      // 1) Save current file’s view state
      const oldModel = editorRef.current.getModel()
      if (oldModel) {
        const oldUri = oldModel.uri.toString()
        viewStatesRef.current[oldUri] = editorRef.current.saveViewState()
      }

      const uri = monacoRef.current.Uri.file(file.path)
      const uriKey = uri.toString()
      let model = monacoRef.current.editor.getModel(uri)
      if (!model) {
        model = monacoRef.current.editor.createModel(file.content, 'typescript', uri)
      }
      editorRef.current.setModel(model)

      if (!fileTrackers.has(uriKey)) {
        console.log('new tracker is being set')
        fileTrackers.set(uriKey, {
          path: file.path,
          type: file.type,
          modelUri: uri,
          lastSavedVersionId: model.getAlternativeVersionId()
        })
      }

      // 4) Restore the new file’s view state (cursor, scroll, etc.)
      const newViewState = viewStatesRef.current[uri.toString()]
      if (newViewState) {
        editorRef.current.restoreViewState(newViewState)
      }
      const tracker = fileTrackers.get(uriKey)
      if (tracker && tracker.type) {
        sendMessageToWorker(model, tracker)
      }
      // Focus the editor so the cursor gets applied
      editorRef.current.focus()
    },
    removeFile(file: LoadedFile) {
      if (!monacoRef.current) return

      const uri = monacoRef.current.Uri.file(file.path)
      const model = monacoRef.current.editor.getModel(uri)
      if (model) {
        model.dispose()

        delete viewStatesRef.current[uri.toString()]
        fileTrackers.delete(uri.toString())
      }
    },
    openFind() {
      editorRef.current?.getAction('actions.find')?.run()
    },
    getActiveModelCode() {
      // 1) Grab the active model
      const model = editorRef.current?.getModel()
      // 2) Return the text, or empty string if none
      return model?.getValue() ?? ''
    },
    saveFiles: async () => handleSave()
  }))

  const handleSave = async () => {
    const changesToSave: ChangedFile[] = []
    const urisToUpdate: string[] = []

    if (formatOnSaveRef.current) {
      try {
        const model = editorRef.current?.getModel()
        if (!model) throw new Error('No active model')
        const code = model.getValue()
        if (!code) throw new Error('No value in model')
        const formattedCode = await formatter(code)
        if (!formattedCode) throw new Error('Error while formatting code')
        model.setValue(formattedCode)
      } catch (error) {
        console.error(error)
      }
    }

    // Step 1: Identify files with unsaved changes
    fileTrackers.forEach((tracker, uriKey) => {
      const model = monaco.editor.getModel(tracker.modelUri)
      if (!model) {
        console.warn(`No model found for URI: ${uriKey}`)
        return
      }

      const currentVersion = model.getAlternativeVersionId()
      console.log(
        `URI: ${uriKey} | Current Version: ${currentVersion} | Last Saved Version: ${tracker.lastSavedVersionId}`
      )

      // Check if the file has unsaved changes
      if (currentVersion !== tracker.lastSavedVersionId) {
        changesToSave.push({
          path: tracker.path,
          content: model.getValue()
        })
        urisToUpdate.push(uriKey)
      }
    })

    // Step 2: Exit if no changes to save
    if (changesToSave.length === 0) {
      console.log('No changes to save')
      return
    }

    try {
      // Step 3: Save the changes via IPC
      await window.editorApi.saveFiles(changesToSave)

      console.log('Save operation successful. Updating trackers...')

      // Step 4: Update the lastSavedVersionId for each saved file
      urisToUpdate.forEach((uriKey) => {
        const tracker = fileTrackers.get(uriKey)
        if (!tracker) {
          console.warn(`No tracker found for URI: ${uriKey}`)
          return
        }

        const model = monaco.editor.getModel(tracker.modelUri)
        if (!model) {
          console.warn(`No model found for tracker with URI: ${uriKey}`)
          return
        }

        tracker.lastSavedVersionId = model.getAlternativeVersionId()
        console.info(`Tracker updated for URI: ${uriKey}`)
      })

      // Step 5: Reset the dirty state
      resetDirty()
      console.log('All dirty files saved successfully!')
    } catch (error) {
      console.error('Error saving files:', error)
      // Optional: Implement user-facing error notifications here
    }
  }

  function insertClosingTag(model: monaco.editor.ITextModel): void {
    if (!editorRef.current) return
    const position = editorRef.current.getPosition()
    if (!model || !position) return

    const textUntilPosition = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    })

    const textAfterPosition = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endLineNumber: position.lineNumber,
      endColumn: model.getLineMaxColumn(position.lineNumber)
    })

    // Match the most recent opening tag before the cursor
    const match = textUntilPosition.match(/<(\w+)([^>]*)>?$/)
    if (match && !/\/\s*$/.test(match[2])) {
      const tag = match[1]
      const closingTag = `</${tag}>`

      // Prevent infinite loop by checking if the closing tag already exists
      if (!textAfterPosition.startsWith(closingTag)) {
        editorRef.current.executeEdits('', [
          {
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column
            ),
            text: closingTag,
            forceMoveMarkers: true
          }
        ])

        // Adjust the cursor position to the original spot, inside the new tag
        editorRef.current.setPosition({
          lineNumber: position.lineNumber,
          column: position.column
        })
      }
    }
  }

  const handleEditorDidMount: OnMount = async (
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ): Promise<void> => {
    editorRef.current = editor
    monacoRef.current = monaco

    monaco.editor.defineTheme('myTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#09090b'
      }
    })
    monaco.editor.setTheme('myTheme')

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      allowJs: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      jsxImportSource: 'react',
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      isolatedModules: true,
      strict: true,
      esModuleInterop: true,
      noEmit: true,
      typeRoots: ['node_modules@types'],
      baseUrl: './',
      paths: {
        '@react-email/*': ['file:///node_modules/@react-email/*']
      }
    })

    // Add our custom global type definitions
    await loadTypeDefinitions(monaco, data.project)

    // Associate a fake file ending with `.tsx` so that TSX features are recognized
    /*const uri = monaco.Uri.parse('file:///main.tsx')
    let model = monaco.editor.getModel(uri)
    if (!model) {
      model = monaco.editor.createModel(editorContent, 'typescript', uri)
    }
    // Set the model in the editor
    editor.setModel(model)

    // Optionally adjust editor model formatting options
    model.updateOptions({ tabSize: 2 })*/

    // Ensure changes sync to the TS worker promptly
    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, // Shortcut: Ctrl/Cmd + C
      () => editor.trigger('keyboard', 'editor.action.clipboardCopyAction', null)
    )

    // Add Cut Command
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, // Shortcut: Ctrl/Cmd + X
      () => editor.trigger('keyboard', 'editor.action.clipboardCutAction', null)
    )

    // Add Paste Command
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, // Shortcut: Ctrl/Cmd + V
      () => editor.trigger('keyboard', 'editor.action.clipboardPasteAction', null)
    )

    // Add Save Command
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
      handleSave()
    })

    editor.onDidChangeModelContent((event) => {
      try {
        const model = editor.getModel()
        if (!model) {
          throw new Error('No model found in editor')
        }

        const file = fileTrackers.get(model.uri.toString())
        if (!file) {
          throw new Error('No tracked file found in editor')
        }

        handleContentChange(model, file, event)
      } catch (error) {
        console.error('Error while editor change: ', error)
      }
    })
    onEditorReady?.()
  }
  loader.config({ monaco })

  return (
    <MonacoEditor
      height="100%"
      defaultLanguage="typescript"
      onMount={handleEditorDidMount}
      options={{
        automaticLayout: true,
        autoClosingBrackets: 'always',
        scrollBeyondLastLine: false,
        wordSeparators: '~!@#$%^&*()-=+[{]}|;:\'",.<>/?',
        formatOnType: true,
        formatOnPaste: true
      }}
    />
  )
})

Editor.displayName = 'Editor'
export default Editor
