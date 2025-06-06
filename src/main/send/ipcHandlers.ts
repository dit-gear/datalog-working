// ipcHandlers.ts
import { ipcMain, Notification, nativeImage } from 'electron'
import fs from 'fs/promises'
import { InitialSendData, Response } from '@shared/shared-types'
import { emailType } from '@shared/projectTypes'
import { appState, datalogs as datalogStore, sendWindowDataMap } from '../core/app-state/state'
import { getSendWindow } from './sendWindow'
import { renderEmail } from '../core/render/renderEmail'
import { sendEmail } from '../core/send-email'
import { getLatestDatalog } from '@shared/utils/getLatestDatalog'
import successicon from '../../../resources/success_icon.png?asset'
import erroricon from '../../../resources/error_icon.png?asset'

export function setupSendIpcHandlers(): void {
  ipcMain.handle('initial-send-data', async (event): Promise<InitialSendData> => {
    try {
      const project = appState.project
      const datalogs = Array.from(datalogStore().values())
      if (!project) throw Error
      const windowId = event.sender.id
      const windowData = sendWindowDataMap.get(windowId)
      if (!windowData) {
        throw new Error(`No window data found for window id: ${windowId}`)
      }
      const { selectedEmail, selection: winSelection } = windowData
      const selection = winSelection ?? (await getLatestDatalog(datalogs, project))
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
  ipcMain.handle(
    'incoming-send-email-request',
    async (event, email: emailType): Promise<Response> => {
      const windowId = event.sender.id
      try {
        const rendered = await renderEmail({ email, windowId })
        if (rendered) {
          await sendEmail({ email, rendered })
        }
        const successotification = new Notification({
          title: 'Email Sent',
          body: `"${email.subject}" sent successfully to ${email.recipients.length} recipient`,
          icon: nativeImage.createFromPath(successicon)
        })
        successotification.show()
        return { success: true }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const errornotification = new Notification({
          title: 'Email could not be sent',
          body: errorMessage,
          icon: nativeImage.createFromPath(erroricon)
        })
        errornotification.show()
        return { success: false, error: errorMessage }
      }
    }
  )
}
