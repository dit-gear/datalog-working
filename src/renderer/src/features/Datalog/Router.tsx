import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Main from './main/main'
import BuilderPage from './builder/builderPage'
import SettingsPage from './Settings/settingsPage'
import { Toaster } from '@components/ui/toaster'

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/builder/:logId" element={<BuilderPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/*<Route path="new-project" element={<NewProjectPage />} />*/}
      </Routes>
      <Toaster />
    </Router>
  )
}

export default AppRouter
