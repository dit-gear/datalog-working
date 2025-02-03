import { pdfType } from '@shared/projectTypes'
import replaceTags, { Tags } from '../../../shared/utils/formatDynamicString'

interface Option {
  label: string
  value: string
}

export function mapPdfTypesToOptions(pdfs: pdfType[], tags?: Tags): Option[] {
  return pdfs.map((pdf) => {
    const name = tags ? replaceTags(pdf.output_name_pattern, tags) : pdf.output_name_pattern
    return {
      label: `${pdf.name} (${name}.pdf)`,
      value: pdf.id
    }
  })
}
