import { emailType } from '@shared/projectTypes'
import { DataObjectType } from '@shared/shared-types'
import fs from 'fs/promises'
import { getActiveProject, datalogs as datalogStore, sendWindowDataMap } from '../app-state/state'
import { getReactTemplate } from '@shared/utils/getReactTemplate'
import { createRenderWorker } from './renderWorkerHelper'
import { getPdfAttachments } from '@shared/utils/getAttachments'
import { getLatestDatalog } from '@shared/utils/getLatestDatalog'
import { WorkerRequest } from './types'

interface renderEmailProps {
  email: emailType
  windowId: number
}

export const renderEmail = async ({ email, windowId }: renderEmailProps) => {
  const project = getActiveProject()
  if (!project) throw new Error('No project')
  const datalogs = Array.from(datalogStore().values())
  if (!datalogs) throw new Error('no selection')
  const selection =
    sendWindowDataMap.get(windowId)?.selection ?? getLatestDatalog(datalogs, project)

  const dataObject: DataObjectType = { project, selection, all: datalogs }

  const templatesDir = project?.templatesDir
  const emailWorker = createRenderWorker()
  const pdfWorker = createRenderWorker()

  try {
    const emailTask = async (): Promise<string | undefined> => {
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
    }

    // Load and render PDF attachments
    const pdfTask = async () => {
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
    }
    const [emailcode, attachmentsToSend] = await Promise.all([emailTask(), pdfTask()])
    return { emailcode, attachmentsToSend }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error(`Failed to process incoming-send-email-request: ${message}`)
    return
  } finally {
    emailWorker.terminate()
    pdfWorker.terminate()
  }
}