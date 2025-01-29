import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Main from './main/main'
import BuilderPage from './builder/builderPage'
import { Toaster } from '@components/ui/toaster'

const queryClient = new QueryClient()

function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/builder/:logId" element={<BuilderPage />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  )
}

export default AppRouter
