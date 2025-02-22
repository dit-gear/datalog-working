import React, { useEffect, useState } from 'react'
import { CardContent } from '@components/ui/card'
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form'
import { formSchemaType } from '../types'
import { emailEditType } from './types'
import { pdfType, TemplateDirectoryFile } from '@shared/projectTypes'
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
import EmailTemplate from './EmailTemplate'
import ApiKeyDialog from './EmailAPI/ApiKeyDialog'
import { getPdfAttachments } from '@shared/utils/getAttachments'
import { Check, X } from 'lucide-react'
import { Input } from '@components/ui/input'
import FormRow from '@components/FormRow'

interface EmailProps {
  scope: 'project' | 'global'
  templates: TemplateDirectoryFile[]
}

const Emails: React.FC<EmailProps> = ({ scope, templates }) => {
  const [pdfs, setPdfs] = useState<pdfType[]>([])
  const project_pdfs = useWatch({ name: 'project_pdfs' })
  const global_pdfs = useWatch({ name: 'global_pdfs' })

  useEffect(() => {
    setPdfs([...global_pdfs, ...project_pdfs])
  }, [project_pdfs, global_pdfs])

  const { control } = useFormContext<formSchemaType>()
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: `${scope}_emails`,
    keyName: 'fieldId'
  })

  const [emailEdit, setEmailEdit] = useState<emailEditType | null>(null)

  return (
    <CardContent key={`Email?_${scope}`}>
      <FormRow
        label="My Email address"
        description="Should at least include your email. Check with your provider for supported format."
      >
        <div>
          <Input className="w-96" placeholder="John Doe <john.doe@example.com>" />
        </div>
      </FormRow>
      <FormRow label="Email API" description="Provider for sending emails">
        <div>
          <ApiKeyDialog />
        </div>
      </FormRow>
      <FormRow label="Email Presets">
        <dd className="mt-1 text-sm leading-6 sm:mt-0 flex flex-col gap-2">
          <Accordion type="single" collapsible className={fields.length ? 'border rounded-md' : ''}>
            {fields.map((email, index) => (
              <AccordionItem key={index} value={`email-${index}`} className="py-4 px-8">
                <AccordionTrigger className="text-base">{email.label}</AccordionTrigger>
                <div className="-mt-12 mr-8 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" className="p-3" variant="ghost">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setEmailEdit({ index, email })}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => remove(index)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <AccordionContent className="grid grid grid-cols-2 px-4 gap-x-4 gap-y-2">
                  <p>To:</p>
                  <p>{email.recipients?.join(', ')}</p>
                  <p>Subject:</p>
                  <p>{email.subject}</p>
                  <p>Email Message:</p>
                  <p>{email.message}</p>
                  <p>Attachments:</p>
                  <p>
                    {email.attachments && email.attachments?.length > 0
                      ? (() => {
                          const pdfAttachments = getPdfAttachments(pdfs, email.attachments, true)
                          return pdfAttachments.join(', ')
                        })()
                      : ''}
                  </p>
                  <p>React template:</p>
                  <p>{email.react}</p>
                  <p>Enabled:</p>
                  {email.enabled ? (
                    <Check className="size-5 text-green-500" />
                  ) : (
                    <X className="size-5 text-red-500" />
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <EmailTemplate
            append={append}
            update={update}
            emailEdit={emailEdit}
            setEmailEdit={setEmailEdit}
            templates={templates}
            pdfs={pdfs}
          />
        </dd>
      </FormRow>
    </CardContent>
  )
}

export default Emails

/*   <dt className="text-sm font-medium leading-6 text-white">Email API</dt>
        <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
          <ApiKeyDialog />
        </dd>
        <dt className="text-sm font-medium leading-6 text-white">FROM Address</dt>
        <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
          <Input />
        </dd>*/
