import { appState, datalogs } from '../../app-state/state'
import { replaceTagsMultiple } from '@shared/utils/formatDynamicString'
import { pdfType } from 'daytalog'

export const getPdfOutputName = (pdf: pdfType, selection?: string[]) => {
  const project = appState.project
  if (!project) throw new Error('No project')
  const logs = Array.from(datalogs().values())
  if (!logs) throw new Error('No logs')

  return replaceTagsMultiple({
    selection,
    logs,
    template: pdf.output_name,
    fallbackName: pdf.label,
    project
  })
}
