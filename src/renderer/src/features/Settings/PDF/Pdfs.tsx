import React, { useState } from 'react'
import { CardContent } from '@components/ui/card'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { formSchemaType } from '../types'
import { pdfEditType } from './types'
import { TemplateDirectoryFile } from '@shared/projectTypes'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@components/ui/accordion'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent
} from '@components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@components/ui/button'
import PdfTemplate from './PdfTemplate'
import { getFileName } from '@renderer/utils/formatString'

interface PdfProps {
  scope: 'project' | 'global'
  templates: TemplateDirectoryFile[]
}

const Pdfs: React.FC<PdfProps> = ({ scope, templates }) => {
  const { control } = useFormContext<formSchemaType>()
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: `${scope}_pdfs`
  })

  const [pdfEdit, setPdfEdit] = useState<pdfEditType | null>(null)

  return (
    <CardContent key={`Pdf_${scope}`}>
      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm font-medium leading-6 text-white">PDFs</dt>
        <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0 flex flex-col gap-2">
          <Accordion type="single" collapsible>
            {fields.map((pdf, index) => (
              <AccordionItem key={index} value={`pdf-${index}`}>
                <AccordionTrigger>{pdf.name}</AccordionTrigger>
                <div className="-mt-12 mr-8 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" className="p-3" variant="ghost">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setPdfEdit({ index, pdf })}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => remove(index)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <AccordionContent className="grid grid grid-cols-2 gap-x-4 gap-y-2">
                  <p>Output Name:</p>
                  <p>{pdf.output_name_pattern}</p>
                  <p>React template:</p>
                  <p>{getFileName(pdf.template)}</p>
                  <p>Show in menu:</p>
                  <p className="text-white">{pdf.show_in_menu && '✔'}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <PdfTemplate
            append={append}
            update={update}
            emailEdit={pdfEdit}
            setEmailEdit={setPdfEdit}
            templates={templates}
          />
        </dd>
      </div>
    </CardContent>
  )
}

export default Pdfs
