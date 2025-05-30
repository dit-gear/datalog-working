import { dialog, Notification, app, nativeImage } from 'electron'
import fs from 'fs/promises'
import { renderPdf } from '../render/renderPdf'
import { pdfType } from '@shared/projectTypes'
import { DatalogType } from '@shared/datalogTypes'
import logger from '../logger'
import replaceTags, { Tags } from '@shared/utils/formatDynamicString'
import { appState, datalogs } from '../app-state/state'
import { getLatestDatalog } from '@shared/utils/getLatestDatalog'
import successicon from '../../../../resources/success_icon.png?asset'
import erroricon from '../../../../resources/error_icon.png?asset'

interface exportPdfProps {
  pdf: pdfType
  selection?: DatalogType | DatalogType[]
  hasDialog?: boolean
}

export const exportPdf = async ({ pdf, selection, hasDialog = false }: exportPdfProps) => {
  if (!selection) {
    const project = appState.project
    if (!project) throw new Error('No project')
    const _datalogs = Array.from(datalogs().values())
    if (!_datalogs) throw new Error('No datalogs')
    selection = await getLatestDatalog(_datalogs, project)
  }

  const log = Array.isArray(selection) ? selection[0] : selection

  const tags: Tags = {
    day: log.day,
    date: log.date,
    projectName: appState.project?.project_name,
    unit: log.unit,
    log: log.id
  }

  const outputName = replaceTags(pdf.output_name, tags)

  app.focus()

  try {
    if (hasDialog) {
      // Open file dialog to get the save location
      const { filePath } = await dialog.showSaveDialog({
        title: `Save ${pdf.label}`,
        defaultPath: outputName,
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
      const res = await renderPdf({ pdf, selection })
      if (!res) {
        throw new Error('Failed to render PDF')
      }

      await fs.writeFile(filePath, Buffer.from(res))

      const successotification = new Notification({
        title: 'Export Complete',
        body: 'Your PDF export was successful!',
        icon: nativeImage.createFromPath(successicon)
      })
      successotification.show()
      return { success: true }
    } else {
      const res = await renderPdf({ pdf, selection })
      if (!res) {
        throw new Error('Failed to render PDF')
      }

      const pdfBuffer = Buffer.from(res)
      const data = {
        filename: outputName,
        mimeType: 'application/pdf',
        base64: pdfBuffer.toString('base64')
      }
      return { success: true, data }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unexpected error while exporting PDF'
    logger.error(errorMessage)
    if (hasDialog) {
      const errornotification = new Notification({
        title: 'Export Failed',
        body: errorMessage,
        icon: nativeImage.createFromPath(erroricon)
      })
      errornotification.show()
    }
    return { success: false, error: 'Export Failed' }
  }
}
