import { pdfType } from '@shared/projectTypes'

export function getPdfAttachments(
  pdfs: pdfType[],
  attachments: string[],
  getNamesOnly: true
): string[]

export function getPdfAttachments(
  pdfs: pdfType[],
  attachments: string[],
  getNamesOnly?: false
): pdfType[]

export function getPdfAttachments(
  pdfs: pdfType[],
  attachments: string[],
  getNamesOnly = false
): (pdfType | string)[] {
  // Match the attachment IDs to PDF objects
  const matchedPdfs = attachments
    .map((attachmentId) => pdfs.find((pdf) => pdf.id === attachmentId))
    .filter(Boolean) as pdfType[]

  // Return either the PDF objects or their names
  return getNamesOnly ? matchedPdfs.map((pdf) => pdf.name) : matchedPdfs
}

interface Option {
  label: string
  value: string
}

export function mapPdfTypesToOptions(pdfs: pdfType[]): Option[] {
  return pdfs.map((pdf) => ({
    label: `${pdf.name} (${pdf.output_name_pattern})`, // Use the `name` from pdfType as the label
    value: pdf.id // Use the `id` from pdfType as the value
  }))
}
