import Table from './table/Table'
import { Toaster } from '@components/ui/toaster'
import { SelectedProvider } from './SelectedContext'
import SendButton from './nav/SendButton'
import ExportButton from './nav/ExportButton'
import BuilderButton from './nav/BuilderButton'
import SettingsButton from './nav/SettingsButton'
import NewProjectButton from './nav/NewProjectButton'
import { useIpcNavigation } from '../hooks/useIpcNavigation'
import { useProject } from '../hooks/useProject'
import { useIpcListeners } from '../hooks/useIpcListeners'

function Main() {
  useIpcNavigation()
  useIpcListeners()

  const { data: project } = useProject()

  return (
    <div>
      <SelectedProvider>
        <div className="container flex flex-col mx-auto w-full sm:px-6 lg:px-8 bg-zinc-950">
          <div>
            <h1 className="text-2xl mt-2 font-bold text-white">Datalog.email</h1>
            <h2 className="min-h-6">{project?.project_name}</h2>
          </div>
          <div className="flex justify-end gap-4">
            <SendButton />
            <ExportButton />
            <BuilderButton />
            <SettingsButton />
          </div>
          <div className="grow">
            <Table />
            <NewProjectButton />
          </div>
        </div>
        <Toaster />
      </SelectedProvider>
    </div>
  )
}

export default Main
