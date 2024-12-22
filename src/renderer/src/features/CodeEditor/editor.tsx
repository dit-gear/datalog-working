import { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react'
import * as monaco from 'monaco-editor'
import { Monaco, Editor as MonacoEditor, OnMount, loader } from '@monaco-editor/react'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
//import { createHighlighter } from 'shiki'
//import { shikiToMonaco } from '@shikijs/monaco'
import { formatter } from '@renderer/utils/prettierFormatter'
import { LoadedFile } from '@shared/shared-types'
import { loadTypeDefinitions } from './utils/typeDefinitions'
import { useInitialData } from './dataContext'

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
}

interface Preview {
  id: string
  type: 'email' | 'pdf'
  code: string
}

const Editor = forwardRef<EditorHandle, {}>((_props, ref) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof monaco | null>(null)

  const { initialData } = useInitialData()
  const data = { project: initialData.activeProject, datalogs: initialData.loadedDatalogs }
  //const [editorContent, setEditorContent] = useState<string>(loadedFile.content)
  const [previewContent, setPreviewContent] = useState<Preview>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [previousPreviewContent, setPreviousPreviewContent] = useState<Preview>()
  const [error, setError] = useState<string | null>(null)
  const previewWorkerRef = useRef<Worker | null>(null)
  const linterWorkerRef = useRef<Worker | null>(null)
  const [isFormatOnSave, setIsFormatOnSave] = useState<boolean>(true)
  const [autoCloseTags, setAutoCloseTags] = useState<boolean>(true)

  const loadTimerRef = useRef<NodeJS.Timeout | null>(null)
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null)
  /*
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

  const loadNewContent = (p: Preview) => {
    !isLoading && p.type === 'pdf' && setIsLoading(true)

    if (loadTimerRef.current) {
      clearTimeout(loadTimerRef.current) // Reset the timer
    }

    loadTimerRef.current = setTimeout(() => {
      loadError()
      setPreviewContent(p)
    }, 300) // Delay duration
  }

  const loadError = (error?: string) => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current) // Reset the timer
    }
    errorTimerRef.current = setTimeout(() => {
      error ? setError(error) : setError(null)
    }, 1000)
  }

  useEffect(() => {
    const previewWorker = new Worker(new URL('@workers/preview-worker.ts', import.meta.url), {
      type: 'module'
    })
    previewWorkerRef.current = previewWorker

    const linterWorker = new Worker(new URL('@workers/linter-worker.ts', import.meta.url), {
      type: 'module'
    })
    linterWorkerRef.current = linterWorker

    previewWorker.onmessage = (e): void => {
      const { id, type, code, error } = e.data
      if (code) {
        loadNewContent({ id, type, code })
      } else if (error) {
        loadError(error)
      }
    }

    linterWorker.onmessage = (e): void => {
      const { lintMessages, error } = e.data
      if (error) {
        console.error('Linting Error:', error)
      } else {
        const markers = lintMessages.map((result) => ({
          startLineNumber: result.line,
          startColumn: result.column,
          endLineNumber: result.endLine || result.line,
          endColumn: result.endColumn || result.column,
          message: result.message,
          severity: monaco.MarkerSeverity.Error
        })) as monaco.editor.IMarkerData[]

        if (editorRef.current) {
          const model = editorRef.current.getModel()
          if (model) {
            monaco.editor.setModelMarkers(model, 'eslint', markers)
          }
        }
      }
    }

    if (editorContent) {
      const request = {
        id: loadedFile.name,
        code: editorContent,
        type: loadedFile.type,
        dataObject: {
          project: data.project,
          selection: getLatestDatalog(data.datalogs, data.project),
          all: data.datalogs
        }
      }
      previewWorker.postMessage(request)
      //linterWorker.postMessage(editorContent)
    }

    // Clean up the worker when the component unmounts
    return () => {
      previewWorker.terminate()
      linterWorker.terminate()
    }
  }, [])

  useEffect(() => {
    if (editorContent && previewWorkerRef.current && linterWorkerRef.current) {
      const request = {
        code: editorContent,
        type: loadedFile.type,
        dataObject: {
          project: data?.project,
          selection: data ? getLatestDatalog(data.datalogs, data.project) : [],
          all: data?.datalogs
        }
      }
      previewWorkerRef.current.postMessage(request)
      //linterWorkerRef.current.postMessage(editorContent)
    }
  }, [editorContent])

  const sendMessageToWorker = (): void => {
    // console.log('editorcontent:', editorContent)
    if (!previewWorkerRef.current || !linterWorkerRef.current) {
      console.error('Workers not initialized')
      return
    }
    const request = {
      code: editorContent,
      type: loadedFile.type,
      dataObject: {
        project: data?.project,
        selection: data ? getLatestDatalog(data.datalogs, data.project) : [],
        all: data?.datalogs
      }
    }
    previewWorkerRef.current.postMessage(request)
    //linterWorkerRef.current.postMessage(editorContent)
  }
*/
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
      let model = monacoRef.current.editor.getModel(uri)
      if (!model) {
        model = monacoRef.current.editor.createModel(file.content, 'typescript', uri)
      }
      editorRef.current.setModel(model)

      // 4) Restore the new file’s view state (cursor, scroll, etc.)
      const newViewState = viewStatesRef.current[uri.toString()]
      if (newViewState) {
        editorRef.current.restoreViewState(newViewState)
      }

      // Focus the editor so the cursor gets applied
      editorRef.current.focus()
    },
    removeFile(file: LoadedFile) {
      if (!monacoRef.current) return

      const uri = monacoRef.current.Uri.file(file.path)
      const model = monacoRef.current.editor.getModel(uri)
      if (model) {
        // 1) Dispose the model so Monaco forgets it (undo stack, text, etc.)
        model.dispose()

        // 2) Remove any saved view state for that URI
        delete viewStatesRef.current[uri.toString()]

        // OPTIONAL: If this file is currently open, you may also want to:
        //    - editorRef.current.setModel(null)
        //    - or switch to another file’s model automatically
        // But that depends on your desired UX.
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
    }
  }))

  function insertClosingTag(): void {
    if (!editorRef.current) return

    const model = editorRef.current.getModel()
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

    /*monaco.languages.setMonarchTokensProvider('typescript', {
      tokenizer: {
        root: [
          [/(?<!\{)>[^<{}]+<(?!=\})/, 'unwrapped-text'],
          [/<\/?/, 'tag-bracket'], // Matches `<` and `</`
          [/>/, 'tag-bracket'], // Matches `>`

          // Match tag names (e.g., `div`, `span`)
          [/[a-zA-Z0-9\-]+(?=\s|\/?>)/, 'tag-name']
        ]
      }
    })*/

    monaco.editor.defineTheme('myTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#000000'
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
      //handleSave()
    })

    if (autoCloseTags) {
      editor.onDidChangeModelContent((event) => {
        if (event.changes.length === 0) return
        const text = event.changes[0].text
        if (text === '>') {
          insertClosingTag()
        }
      })
    }

    //shikiToMonaco(highlighter, editor)
    //sendMessageToWorker()
  }
  loader.config({ monaco })

  /*function handleEditorChange(value: string | undefined): void {
    const newValue = value || ''
    setEditorContent(newValue)
    if (editorRef.current && autoCloseTags) {
      editorRef.current.onDidChangeModelContent((event) => {
        const changes = event.changes
        if (changes.length === 0) return

        const change = changes[0]
        const text = change.text

        // Check if the user typed a ">"
        if (text === '>') {
          insertClosingTag()
        }
      })
    }
    // Post message to worker with the new content
    if (previewWorkerRef.current && linterWorkerRef.current) {
      previewWorkerRef.current.postMessage(newValue)
      //linterWorkerRef.current.postMessage(newValue)
    }
  }*/
  /*async function formatCode(): Promise<void> {
    const formattedCode = await formatter(editorContent)
    setEditorContent(formattedCode)
    if (previewWorkerRef.current && linterWorkerRef.current) {
      previewWorkerRef.current.postMessage(formattedCode)
      linterWorkerRef.current.postMessage(formattedCode)
    }
  }*/

  /*
  const handleSave = async (): Promise<void> => {
    let codeToSave = editorContent
    if (isFormatOnSave) {
      codeToSave = await formatter(editorContent)
    }
    const response = await window.editorApi.saveFile({ ...loadedFile, content: codeToSave })
    if (response.success) {
      console.log('File saved successfully')
    } else {
      console.error('Error saving file:', response.error)
    }
    setEditorContent(codeToSave)
    if (previewWorkerRef.current && linterWorkerRef.current) {
      previewWorkerRef.current.postMessage(codeToSave)
      linterWorkerRef.current.postMessage(codeToSave)
    }
  }*/

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
