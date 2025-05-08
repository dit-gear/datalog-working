import { useProject } from '../../hooks/useProject'
import { Button } from '@components/ui/button'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const BuilderButton = () => {
  const { data: project } = useProject()
  const navigate = useNavigate()
  return (
    <Button onClick={() => navigate('/builder')} disabled={!project}>
      <Plus className="mr-2 h-4 w-4" />
      New Shooting Day
    </Button>
  )
}

export default BuilderButton
