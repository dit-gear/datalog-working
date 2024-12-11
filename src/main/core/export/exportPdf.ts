import { dialog, Notification } from 'electron'
import fs from 'fs/promises'
import { renderPdf } from '../render/renderPdf'
import { pdfType } from '@shared/projectTypes'
import { DatalogType } from '@shared/datalogTypes'
import logger from '../logger'

interface exportPdfProps {
  pdf: pdfType
  selection?: DatalogType | DatalogType[]
}

export const exportPdf = async ({ pdf, selection }: exportPdfProps) => {
  try {
    const res = await renderPdf({ pdf, selection })
    if (!res) {
      throw new Error('Failed to render PDF')
    }

    // Open file dialog to get the save location
    const { filePath } = await dialog.showSaveDialog({
      title: `Save ${pdf.name} PDF`,
      defaultPath: pdf.output_name_pattern, // Default name for the file
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    // If user cancels the save dialog, exit the function
    if (!filePath) {
      console.log('File save was canceled by the user.')
      return
    }

    // Decode the base64 string and save to the selected location
    const pdfBuffer = Buffer.from(res, 'base64')
    await fs.writeFile(filePath, pdfBuffer)

    const successotification = new Notification({
      title: 'Export Complete',
      body: 'Your PDF export was successful!'
    })
    successotification.show()
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unexpected error while exporting PDF'
    logger.error(errorMessage)
    const errornotification = new Notification({
      title: 'Export Failed',
      body: errorMessage
    })

    errornotification.show()
  }
}
