import { useNavigate } from 'react-router-dom'
import { useProject } from '../hooks/useProject'
import { useEmailApi } from '@renderer/utils/useCheckEmailAPI'
import CloseButton from '@components/CloseButton'
import Settings from './Settings'

function SettingsPage() {
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject()
  const { data: emailApiExists, isLoading: isEmailApiLoading } = useEmailApi()
  if (isLoading || isEmailApiLoading) {
    return null
  }

  if (!project?.data) {
    navigate('/new-project')
    return null
  }

  return (
    <div className="px-4">
      <div className="mx-auto w-[90vw] gap-2 container grid md:grid-cols-[220px_minmax(0,1fr)] mt-4 mb-2">
        <h1 className="ml-1 text-3xl font-semibold leading-none tracking-tight">Settings</h1>
        <div></div>
      </div>
      <CloseButton onClick={() => navigate('/')} />
      <Settings
        defaults={project.data.settings}
        email_api_exists={emailApiExists ?? false}
        templates={project.data.templatesDir}
      />
    </div>
  )
}

export default SettingsPage
