// ipcHandlers.ts
import { ipcMain } from 'electron'
import fs from 'fs/promises'
import { DataObjectType, InitialSendData } from '@shared/shared-types'
import { emailType } from '@shared/projectTypes'
import {
  getActiveProject,
  datalogs as datalogStore,
  sendWindowDataMap
} from '../core/app-state/state'
import { getSendWindow } from './sendWindow'
import { getReactTemplate } from '@shared/utils/getReactTemplate'
import { createRenderWorker } from '../core/render/renderWorkerHelper'
import { getPdfAttachments } from '@shared/utils/getAttachments'
import { getLatestDatalog } from '@shared/utils/getLatestDatalog'
import { WorkerRequest } from '../core/render/types'

export function setupSendIpcHandlers(): void {
  ipcMain.handle('initial-send-data', async (event): Promise<InitialSendData> => {
    try {
      const project = getActiveProject()
      const datalogs = Array.from(datalogStore().values())
      if (!project) throw Error
      const windowId = event.sender.id
      const { selectedEmail, selection } = sendWindowDataMap.get(windowId) || {}

      return { selectedEmail, project, selection, datalogs }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      throw new Error(`Failed to load send window data: ${message}`)
    }
  })
  ipcMain.on('show-send-window', (event) => {
    const sendWindow = getSendWindow(event.sender.id)
    sendWindow?.show()
  })
  ipcMain.on(`close-send-window`, (event) => {
    const sendWindow = getSendWindow(event.sender.id)
    if (sendWindow) {
      sendWindow.close()
    }
  })
  ipcMain.handle('get-file-content', async (_event, filePath: string) => {
    try {
      await fs.access(filePath)
      const content = await fs.readFile(filePath, 'utf8')
      return content
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      throw new Error(`Failed to read file: ${message}`)
    }
  })
  ipcMain.handle('get-multiple-file-contents', async (_event, filePaths: string[]) => {
    try {
      const fileReadPromises = filePaths.map(async (filePath) => {
        await fs.access(filePath)
        const content = await fs.readFile(filePath, 'utf8')
        return { filePath, content }
      })

      const results = await Promise.all(fileReadPromises)
      const fileContents = results.reduce(
        (acc, { filePath, content }) => {
          acc[filePath] = content
          return acc
        },
        {} as Record<string, string>
      )

      return fileContents
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      throw new Error(`Failed to read files: ${message}`)
    }
  })
  ipcMain.handle('incoming-send-email-request', async (event, email: emailType) => {
    console.log('handle incoming send email started')
    const project = getActiveProject()
    if (!project) throw new Error('No project')
    const datalogs = Array.from(datalogStore().values())
    if (!datalogs) throw new Error('no selection')
    const windowId = event.sender.id
    const selection =
      sendWindowDataMap.get(windowId)?.selection ?? getLatestDatalog(datalogs, project)

    const dataObject: DataObjectType = { project, selection, all: datalogs }

    const templatesDir = project?.templatesDir
    const emailWorker = createRenderWorker()
    const pdfWorker = createRenderWorker()

    try {
      // Gather promises for all work that needs to be done

      const emailTask = (async (): Promise<string | undefined> => {
        if (email.react) {
          const emailpath = getReactTemplate(email.react, templatesDir, 'email')
          if (emailpath) {
            await fs.access(emailpath.path)
            const code = await fs.readFile(emailpath.path, 'utf8')
            const req: WorkerRequest = {
              id: email.name,
              code,
              type: emailpath.type,
              dataObject
            }
            const renderedEmail = await emailWorker.render(req)
            const emailcode = renderedEmail.html
            return emailcode
          }
        }
        return
      })()

      // Load and render PDF attachments
      const pdfTask = (async () => {
        const attachmentsToSend: Array<{ content: string; filename: string }> = []
        if (project.pdfs && email.attachments && email.attachments.length > 0) {
          const attachments = getPdfAttachments(project.pdfs, email.attachments)
          for (const att of attachments) {
            if (!att.react) continue
            const pdfpath = getReactTemplate(att.react, templatesDir, 'pdf')
            if (!pdfpath) continue
            await fs.access(pdfpath.path)
            const codepdf = await fs.readFile(pdfpath.path, 'utf8')
            const reqpdf: WorkerRequest = {
              id: att.id,
              code: codepdf,
              type: pdfpath.type,
              dataObject
            }
            const renderedPdf = await pdfWorker.render(reqpdf)
            attachmentsToSend.push({
              content: renderedPdf.html,
              filename: att.output_name_pattern
            })
          }
        }
        return attachmentsToSend
      })()

      const [emailcode, attachmentsToSend] = await Promise.all([emailTask, pdfTask])
      console.log('email:', emailcode, 'att: ', attachmentsToSend)
      // Example:
      // await sendEmail(email, { html: emailcode, attachments: attachmentsToSend })
      return
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      console.error(`Failed to process incoming-send-email-request: ${message}`)
      return
    } finally {
      emailWorker.terminate()
      pdfWorker.terminate()
    }
  })
}
