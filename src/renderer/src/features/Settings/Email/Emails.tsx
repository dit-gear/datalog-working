import React, { useState } from 'react'
import { CardContent } from '@components/ui/card'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { formSchemaType } from '../types'
import { emailEditType } from './types'
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
import ApiKeyDialog from './ApiKeyDialog'

interface EmailProps {
  scope: 'project' | 'global'
}

const Emails: React.FC<EmailProps> = ({ scope }) => {
  const { control } = useFormContext<formSchemaType>()
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: `${scope}_emails`
  })

  const [emailEdit, setEmailEdit] = useState<emailEditType | null>(null)

  return (
    <CardContent key={`Email?_${scope}`}>
      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm font-medium leading-6 text-white">Email API</dt>
        <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
          <ApiKeyDialog />
        </dd>
        <dt className="text-sm font-medium leading-6 text-white">Emails</dt>
        <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0 flex flex-col gap-2">
          <Accordion type="single" collapsible>
            {fields.map((email, index) => (
              <AccordionItem key={index} value={`email-${index}`}>
                <AccordionTrigger>{email.name}</AccordionTrigger>
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
                <AccordionContent className="grid grid grid-cols-2 gap-x-4 gap-y-2">
                  <p>From:</p>
                  <p>{email.sender}</p>
                  <p>To:</p>
                  <p>{email.recipients?.join(', ')}</p>
                  <p>Subject:</p>
                  <p>{email.subject}</p>
                  <p>Email Message:</p>
                  <p>{email.message}</p>
                  <p>React template:</p>
                  <p>{email.template}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <EmailTemplate
            append={append}
            update={update}
            emailEdit={emailEdit}
            setEmailEdit={setEmailEdit}
          />
        </dd>
      </div>
    </CardContent>
  )
}

export default Emails
