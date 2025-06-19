import { emailType, DaytalogProps } from 'daytalog'
import fs from 'fs/promises'
import { datalogs as datalogStore, sendWindowDataMap, appState } from '../app-state/state'
import { getReactTemplate } from '@shared/utils/getReactTemplate'
import { createRenderWorker } from './renderWorkerHelper'
import { getPdfAttachments } from '@shared/utils/getAttachments'
import { WorkerRequest } from './types'
import logger from '../logger'
import { getPdfOutputName } from './utils/getOutputName'

interface renderEmailProps {
  email: emailType
  windowId: number
}

export const renderEmail = async ({
  email,
  windowId
}: renderEmailProps): Promise<{
  emailcode: {
    code: string
    plainText?: string
  }
  attachmentsToSend: {
    content: string
    filename: string
  }[]
}> => {
  const project = appState.project
  if (!project) throw new Error('No project')
  const logs = Array.from(datalogStore().values())
  if (!logs) throw new Error('no logs')
  const selection = sendWindowDataMap.get(windowId)?.selection

  const daytalogProps: DaytalogProps = {
    project,
    logs,
    selection: selection,
    message: email.message ?? ''
  }

  const templatesDir = project?.templatesDir
  const emailWorker = createRenderWorker()
  const pdfWorker = createRenderWorker()

  try {
    const emailTask = async (): Promise<{ code: string; plainText?: string } | undefined> => {
      if (email.react) {
        const emailpath = getReactTemplate(email.react, templatesDir, 'email')
        if (emailpath) {
          await fs.access(emailpath.path)
          const code = await fs.readFile(emailpath.path, 'utf8')
          const req: WorkerRequest = {
            id: email.id,
            path: emailpath.path,
            code,
            type: emailpath.type,
            daytalogProps
          }
          const renderedEmail = await emailWorker.render(req)
          if (renderedEmail.error) {
            throw new Error(`Email render failed: ${renderedEmail.error}`)
          }
          return renderedEmail
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
            path: pdfpath.path,
            code: codepdf,
            type: pdfpath.type,
            daytalogProps
          }
          const renderedPdf = await pdfWorker.render(reqpdf)
          if (renderedPdf.error) {
            throw new Error(`PDF render failed: ${renderedPdf.error}`)
          }
          const pdfBuffer = Buffer.from(renderedPdf.code)
          attachmentsToSend.push({
            content: pdfBuffer.toString('base64'),
            filename: getPdfOutputName(att, selection)
          })
        }
      }
      return attachmentsToSend
    }
    const [emailcode, attachmentsToSend] = await Promise.all([emailTask(), pdfTask()])
    if (!emailcode) throw new Error('No email rendered')
    return { emailcode, attachmentsToSend }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    logger.error(`Error in renderEmail: ${message}`)
    throw new Error(`Error in renderEmail: ${message}`)
  } finally {
    emailWorker.terminate()
    pdfWorker.terminate()
  }
}
