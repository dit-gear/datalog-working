import React, { useState } from 'react'
import { CardContent } from '@components/ui/card'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { formSchemaType } from '../../types'
import { pdfEditType } from '../types'
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
import { Check, X } from 'lucide-react'
import FormRow from '@components/FormRow'
import WarningTooltip from '@components/WarningTooltip'

interface PdfProps {
  scope: 'project' | 'global'
  templates: TemplateDirectoryFile[]
}

const Pdfs: React.FC<PdfProps> = ({ scope, templates }) => {
  const { control } = useFormContext<formSchemaType>()
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: `${scope}_pdfs`,
    keyName: 'fieldId'
  })

  const [pdfEdit, setPdfEdit] = useState<pdfEditType | null>(null)

  return (
    <CardContent key={`Pdf_${scope}`}>
      <FormRow label="PDF Presets">
        <dd className="mt-1 text-sm leading-6 sm:mt-0 flex flex-col gap-2">
          <Accordion type="single" collapsible className={fields.length ? 'border rounded-md' : ''}>
            {fields.map((pdf, index) => (
              <AccordionItem key={index} value={`pdf-${index}`} className="py-4 px-8">
                <AccordionTrigger>
                  <span className="flex gap-2 items-center">
                    {pdf.label}
                    {!templates.find((t) => t.name === pdf.react && t.type === 'pdf') && (
                      <WarningTooltip text="Template file no longer exists." />
                    )}
                  </span>
                </AccordionTrigger>
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
                <AccordionContent className="grid grid grid-cols-2 px-4 gap-x-4 gap-y-2">
                  <p>Output Name:</p>
                  <p>{pdf.output_name}</p>
                  <p>React template:</p>
                  <span className="flex items-center gap-1">
                    {templates.find((t) => t.name === pdf.react && t.type === 'pdf') ? (
                      pdf.react
                    ) : (
                      <>
                        <p className="text-red-800">{pdf.react}</p>{' '}
                        <WarningTooltip text="Template file no longer exists." />
                      </>
                    )}
                  </span>
                  <p>Enabled:</p>
                  {pdf.enabled ? (
                    <Check className="size-5 text-green-500" />
                  ) : (
                    <X className="size-5 text-red-500" />
                  )}
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
      </FormRow>
    </CardContent>
  )
}

export default Pdfs
