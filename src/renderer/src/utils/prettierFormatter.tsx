import { format } from 'prettier'
import parserTypescript from 'prettier/plugins/typescript'
import parserEstreePlugin from 'prettier/plugins/estree'

export const formatter = async (editorContent: string): Promise<string> => {
  return format(editorContent, {
    parser: 'typescript',
    plugins: [parserTypescript, parserEstreePlugin],
    singleQuote: true,
    jsxSingleQuote: true,
    printWidth: 100
  })
}
