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
import MessageBox from '@components/MessageBox'

function Main() {
  useIpcNavigation()
  useIpcListeners()

  const { data: project } = useProject()

  return (
    <div>
      <SelectedProvider>
        <div className="container flex flex-col mx-auto w-full sm:px-6 lg:px-8">
          <div className="sticky top-0 z-10 bg-zinc-950 flex justify-between items-end mt-8 pb-4">
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
          <div className="grow mb-20">
            <Table />
            <NewProjectButton />
          </div>
          {/*<MessageBox fullWidth />*/}
        </div>
        <Toaster />
      </SelectedProvider>
    </div>
  )
}

export default Main
