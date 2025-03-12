import { useParams, useNavigate } from 'react-router-dom'
import { useProject } from '../hooks/useProject'
import { useDatalogs } from '../hooks/useDatalogs'
import Builder from './builder'
import CloseButton from '@components/CloseButton'

function BuilderPage() {
  const navigate = useNavigate()
  const { logId } = useParams<{ logId?: string }>()
  const { data: project, isLoading: projectsLoading } = useProject()
  const { data: logs, isLoading: datalogsLoading } = useDatalogs()

  const selectedLog = logs.find((log) => log.id === logId)

  if (projectsLoading || datalogsLoading || !project?.data) {
    return null
  }

  return (
    <div className="">
      <div className="flex justify-center items-center mt-4 mb-1">
        <h2 className="text-1xl font-semibold leading-none tracking-tight">
          {logId ? `Editing: ${logId}` : 'New Shooting Day'}
        </h2>
      </div>
      <CloseButton onClick={() => navigate('/')} />
      <Builder project={project.data} previousEntries={logs} selected={selectedLog} />
    </div>
  )
}

export default BuilderPage
