import TableConstructor from './TableConstructor'
import EmptyStateCard from '@components/EmptyStateCard'
import { useNavigate } from 'react-router-dom'
import { useDatalogs } from '../../hooks/useDatalogs'
import { useProject } from '../../hooks/useProject'

const Table = () => {
  const navigate = useNavigate()
  const { data: logs } = useDatalogs()
  const { data: project } = useProject()

  if (!project?.data) return null

  if (!logs.length)
    return (
      <EmptyStateCard
        title="No Logs Loaded"
        buttonLabel="New Shooting Day"
        buttonAction={() => navigate('/builder')}
      />
    )

  return <TableConstructor logs={logs} />
}

export default Table
