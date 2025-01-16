import { ScrollArea } from '@components/ui/scroll-area'
import { DynamicTable } from './table/DynamicTable'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@components/ui/accordion'
import { ClipsTable } from './table/ClipsTable'
import { useFieldArray } from 'react-hook-form'

const Preview = () => {
  const fields = useFieldArray({ name: 'ocf.clips' })

  console.table(fields)

  const objA = [
    {
      id: 'x',
      col1: '',
      col2: ''
    }
  ]

  const objB = [
    {
      id: '1',
      col3: '',
      col4: ''
    },
    {
      id: '2',
      col3: '',
      col4: ''
    },
    {
      id: '3',
      col3: '',
      col4: ''
    }
  ]

  const mergedObj = [
    {
      id: 'x',
      col1: '',
      co12: '',
      col3: '', // ['2', '']
      col4: '' //['2', '']
    }
  ]

  return <div></div>
  /*return (
    <Accordion type="single" collapsible>
      <AccordionItem value="ocf">
        <AccordionTrigger className="text-sm font-medium leading-6 text-white">
          OCF
        </AccordionTrigger>
        <AccordionContent className="h-[50vh] overflow-scroll hover:cursor-all-scroll">
          <DynamicTable field="ocf.clips" />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="sound">
        <AccordionTrigger className="text-sm font-medium leading-6 text-white">
          Sound
        </AccordionTrigger>
        <AccordionContent>
          <ScrollArea className="h-[50vh] w-[75vw] overflow-hidden" type="auto">
            <DynamicTable field="sound.clips" />
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="proxies">
        <AccordionTrigger className="text-sm font-medium leading-6 text-white">
          Proxies
        </AccordionTrigger>
        <AccordionContent>
          <ScrollArea className="h-[50vh] w-[75vw] overflow-hidden" type="auto">
            <DynamicTable field="proxy.clips" />
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="custom">
        <AccordionTrigger className="text-sm font-medium leading-6 text-white">
          Custom Metadata
        </AccordionTrigger>
        <AccordionContent>
          <ScrollArea className="h-[50vh] w-[75vw] overflow-hidden" type="auto">
            <DynamicTable field="custom" />
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="clips">
        <AccordionTrigger className="text-sm font-medium leading-6 text-white">
          Output
        </AccordionTrigger>
        <AccordionContent>
          <ScrollArea className="h-[50vh] overflow-hidden" type="auto">
            <ClipsTable />
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )*/
}

export default Preview
