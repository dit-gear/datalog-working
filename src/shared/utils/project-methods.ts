import { pdfType } from '@shared/projectTypes'

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
