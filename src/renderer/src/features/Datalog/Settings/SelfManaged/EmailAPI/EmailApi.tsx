import FormRow from '@components/FormRow'
import ApiKeyDialog from './ApiKeyDialog'
import RemoveApiButton from './RemoveApi'
import { useWatch } from 'react-hook-form'

const EmailApi = () => {
  const hasConfig = useWatch({ name: 'email_api_exist' })
  return (
    <FormRow label="Email API Config" description="Email Provider API or custom API endpoint">
      <div className="flex gap-2">
        <ApiKeyDialog />
        {hasConfig && <RemoveApiButton />}
      </div>
    </FormRow>
  )
}

export default EmailApi
