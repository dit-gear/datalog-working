import { useNavigate } from 'react-router-dom'
import { useProject } from '../hooks/useProject'
import { Button } from '@components/ui/button'
import Settings from './Settings'

function SettingsPage() {
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject()

  if (isLoading || !project?.data) {
    return null
  }

  return (
    <div className="px-4">
      <div className="flex justify-between ml-28">
        <h1 className="-ml-1 text-3xl font-semibold leading-none tracking-tight">Settings</h1>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Back
        </Button>
      </div>
      <Settings defaults={project.data.settings} templates={project.data.templatesDir} />
    </div>
  )
}

export default SettingsPage
