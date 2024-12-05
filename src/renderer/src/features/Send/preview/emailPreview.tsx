import { useWatch } from 'react-hook-form'
import { Preview } from './Preview'
import { TabsContent } from '@components/ui/tabs'

const EmailPreview = () => {
  const email = useWatch({ name: 'react' })
  return (
    <TabsContent value="email" className="h-full w-full">
      {email && <Preview react={email} type="email" />}
    </TabsContent>
  )
}

export default EmailPreview
