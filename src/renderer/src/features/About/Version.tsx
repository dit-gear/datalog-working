import { useState, useEffect } from 'react'

const Version = () => {
  const [version, setVersion] = useState('')

  useEffect(() => {
    window.sharedApi.getAppVersion().then(setVersion)
  }, [])

  return <p className="text-sm">{`Version: ${version}`}</p>
}

export default Version
