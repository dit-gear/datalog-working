const activateMonacoJSXHighlighter = async (
  monacoEditor,
  monaco
): Promise<{ monacoJSXHighlighter: typeof MonacoJSXHighlighter }> => {
  const { default: traverse } = await import('@babel/traverse')
  const { parse } = await import('@babel/parser')
  const { default: MonacoJSXHighlighter } = await import('monaco-jsx-highlighter')
  const babelParse = (code) =>
    parse(code, {
      sourceType: 'module',
      plugins: ['jsx']
    })
  const monacoJSXHighlighter = new MonacoJSXHighlighter(monaco, babelParse, traverse, monacoEditor)
  monacoJSXHighlighter.highlightOnDidChangeModelContent(100)
  monacoJSXHighlighter.addJSXCommentCommand()

  return {
    monacoJSXHighlighter
  }
}
export default activateMonacoJSXHighlighter
