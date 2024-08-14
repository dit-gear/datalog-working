import fs from 'fs'
import path from 'path'

interface FindFilesOptions {
  includeFileName?: string
  excludeFileName?: string
}

export default async function findFilesByType(
  directory: string,
  fileType: string,
  options: FindFilesOptions = {}
): Promise<string[]> {
  let files: string[] = []

  try {
    const filesAndDirs = fs.readdirSync(directory, { withFileTypes: true })

    for (const dirent of filesAndDirs) {
      const fullPath = path.join(directory, dirent.name)

      if (dirent.isDirectory()) {
        // Recursively process directories
        files = files.concat(await findFilesByType(fullPath, fileType, options))
      } else {
        const fileExtension = path.extname(dirent.name).toLowerCase()
        const fileName = path.basename(dirent.name)

        // Proceed if the file has the correct file type extension
        if (fileExtension === `.${fileType}`) {
          // Apply includeFileName condition
          if (
            options.includeFileName &&
            fileName.toLowerCase() === options.includeFileName.toLowerCase()
          ) {
            // If includeFileName is specified and matches, add this file
            files.push(fullPath)
          }
          // Apply excludeFileName condition
          else if (
            options.excludeFileName &&
            fileName.toLowerCase() === options.excludeFileName.toLowerCase()
          ) {
            // If excludeFileName is specified and matches, skip this file
            continue
          }
          // Add the file if no include or exclude conditions are specified
          else if (!options.includeFileName && !options.excludeFileName) {
            files.push(fullPath)
          }
        }
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error)
  }
  return files
}
