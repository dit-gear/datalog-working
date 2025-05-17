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
import AppIcon from '../../../assets/appIconlight.png'

function Main() {
  useIpcNavigation()
  useIpcListeners()

  const { data: project } = useProject()

  return (
    <div>
      <SelectedProvider>
        <div className="container flex flex-col mx-auto w-full sm:px-6 lg:px-8 bg-zinc-950">
          <div className="flex justify-between items-end mt-2">
            <div className="flex gap-1 items-center">
              <img src={AppIcon} className="size-20" />
              <div>
                <h1 className="text-2xl font-bold text-white">Datalog.email</h1>
                <h2>{project?.project_name}</h2>
              </div>
            </div>
            <div className="flex gap-4">
              <SendButton />
              <ExportButton />
              <BuilderButton />
              <SettingsButton />
            </div>
          </div>
          <div className="grow mt-4">
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
