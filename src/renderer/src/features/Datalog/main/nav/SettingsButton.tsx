import { useProject } from '../../hooks/useProject'
import { Button } from '@components/ui/button'
import { SettingsIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SettingsButton = () => {
  const { data: project } = useProject()
  const navigate = useNavigate()
  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={() => navigate('/settings')}
      disabled={!project?.data}
    >
      <SettingsIcon className="h-4 w-4" />
    </Button>
  )
}

export default SettingsButton
