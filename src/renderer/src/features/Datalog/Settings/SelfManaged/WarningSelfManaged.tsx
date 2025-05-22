import { useWatch } from 'react-hook-form'
import WarningTooltip from '@components/WarningTooltip'

const WarningSelfManaged = () => {
  const [global_email_sender, new_email_api, email_api_exist] = useWatch({
    name: ['global_email_sender', 'new_email_api', 'email_api_exist'] // array of paths
  })

  if (!global_email_sender) {
    return <WarningTooltip text="No Email Sender set" />
  }

  if (!new_email_api && !email_api_exist) {
    return <WarningTooltip text="No Email API configuration" />
  }

  return
}

export default WarningSelfManaged
