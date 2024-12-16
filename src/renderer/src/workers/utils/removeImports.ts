export const removeImports = async (code: string): Promise<string> => {
  const lines = code.split('\n')
  const processedLines: string[] = []
  let inImportBlock = false

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (!inImportBlock && trimmedLine.startsWith('import ')) {
      // We've encountered an import statement
      inImportBlock = true

      // Check if it’s a single-line import that ends right here.
      // Heuristics:
      // - If it contains `from '...'` or `from "..."` and line ends immediately after that, it's complete.
      // - If it ends with a semicolon, it's complete.
      //
      // For example: `import React from 'react'`
      // This line contains `from 'react'` and doesn't continue with a comma, so we consider it ended.

      // Check if it looks like a complete single-line import
      const isSingleLineComplete =
        // Ends with a semicolon
        trimmedLine.endsWith(';') ||
        // or has `from '...'` or `from "..."` ending the line
        /(from\s+['"][^'"]+['"]$)/.test(trimmedLine)

      if (isSingleLineComplete) {
        // The import ends on this same line
        inImportBlock = false
      }
    } else if (inImportBlock) {
      // We are inside a multi-line import statement.
      // We continue until we find a line that marks its end:
      // - Ends with `;`
      // - Contains `from '...'` or `from "..."` at the end of the line
      const trimmedLine = line.trim()
      const importEnds = trimmedLine.endsWith(';') || /(from\s+['"][^'"]+['"]$)/.test(trimmedLine)

      if (importEnds) {
        inImportBlock = false
      }
      // Note: We do not push import lines into processedLines.
    } else {
      // Not currently in an import block, so we keep this line
      processedLines.push(line)
    }
  }

  return processedLines.join('\n')
}
