import { Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Main from './main/main'
import BuilderPage from './builder/builderPage'
import { Toaster } from '@components/ui/toaster'

type AppRouterProps = {
  defaultRoute?: string | null
}

function AppRouter({ defaultRoute }: AppRouterProps) {
  const navigate = useNavigate()

  useEffect(() => {
    if (defaultRoute) {
      navigate(`/${defaultRoute}`, { replace: true })
    }
  }, [defaultRoute])

  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/builder/:logId" element={<BuilderPage />} />
        {/*<Route path="/settings" element={<SettingsPage />} />
        <Route path="new-project" element={<NewProjectPage />} />*/}
      </Routes>
      <Toaster />
    </>
  )
}

export default AppRouter
