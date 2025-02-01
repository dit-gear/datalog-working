import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const RouteData = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const initialRoute = params.get('initialRoute')
    // Navigate right away so the default page never flashes
    console.log(initialRoute)
    navigate(initialRoute ? `/${initialRoute}` : '/', { replace: true })
  }, [navigate])

  return null
}

export default RouteData
