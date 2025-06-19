import { pdfType, DaytalogProps } from 'daytalog'
import fs from 'fs/promises'
import { datalogs as datalogStore, appState } from '../app-state/state'
import { getReactTemplate } from '@shared/utils/getReactTemplate'
import { createRenderWorker } from './renderWorkerHelper'
import { WorkerRequest } from './types'
import logger from '../logger'

interface renderPdfProps {
  pdf: pdfType
  selection?: string[]
}
export const renderPdf = async ({ pdf, selection }: renderPdfProps): Promise<string> => {
  const project = appState.project
  if (!project) throw new Error('No project')
  const logs = Array.from(datalogStore().values())
  if (!logs) throw new Error('No logs')

  const daytalogProps: DaytalogProps = {
    project,
    logs,
    message: '',
    selection
  }

  const templatesDir = project?.templatesDir
  const pdfWorker = createRenderWorker()
  try {
    if (!pdf.react) throw Error('No react template in preset')
    const pdfpath = getReactTemplate(pdf.react, templatesDir, 'pdf')
    if (!pdfpath) throw Error('Could not find jsx/tsx file. Has it been moved or deleted?')
    await fs.access(pdfpath.path)
    const code = await fs.readFile(pdfpath.path, 'utf8')
    const req: WorkerRequest = {
      id: pdf.id,
      path: pdfpath.path,
      code: code,
      type: pdfpath.type,
      daytalogProps
    }
    const result = await pdfWorker.render(req)
    if (result.error) {
      // Propagate worker error message
      throw new Error(`PDF render failed: ${result.error}`)
    }
    return result.code
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    logger.error(`Error in renderPdf: ${message}`)
    throw new Error(message)
  } finally {
    pdfWorker.terminate()
  }
}
