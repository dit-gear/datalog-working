import { pdfType } from '@shared/projectTypes'
import { DatalogType } from '@shared/datalogTypes'
import { DataObjectType } from '@shared/shared-types'
import fs from 'fs/promises'
import { datalogs as datalogStore, appState } from '../app-state/state'
import { getLatestDatalog } from '@shared/utils/getLatestDatalog'
import { getReactTemplate } from '@shared/utils/getReactTemplate'
import { createRenderWorker } from './renderWorkerHelper'
import { WorkerRequest } from './types'
import logger from '../logger'

interface renderPdfProps {
  pdf: pdfType
  selection?: DatalogType | DatalogType[]
}
export const renderPdf = async ({ pdf, selection }: renderPdfProps) => {
  const project = appState.activeProject
  if (!project) throw new Error('No project')
  const datalogs = Array.from(datalogStore().values())
  if (!datalogs) throw new Error('No datalogs')
  if (!selection) selection = getLatestDatalog(datalogs, project)

  const dataObject: DataObjectType = { project, selection, all: datalogs }

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
      code: code,
      type: pdfpath.type,
      dataObject
    }
    const renderedPdf = await pdfWorker.render(req)
    return renderedPdf.code
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    logger.error(`Error in renderPdf: ${message}`)
    return
  } finally {
    pdfWorker.terminate()
  }
}
