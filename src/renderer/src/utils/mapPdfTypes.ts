import { pdfType } from '@shared/projectTypes'
import replaceTags, { Tags } from '../../../shared/utils/formatDynamicString'

interface Option {
  label: string
  value: string
}

export function mapPdfTypesToOptions(pdfs: pdfType[], tags?: Tags): Option[] {
  return pdfs.map((pdf) => {
    const name = tags ? replaceTags(pdf.output_name, tags) : pdf.output_name
    return {
      label: `${pdf.label} (${name})`,
      value: pdf.id
    }
  })
}
