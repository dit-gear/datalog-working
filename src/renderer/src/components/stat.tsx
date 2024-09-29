import { ReactNode } from 'react'

interface StatProps {
  label: string
  warning?: boolean
  children: ReactNode
}

const Stat: React.FC<StatProps> = ({ label, warning, children }) => {
  return (
    <div className="min-h-32 max-h-64 h-full transition-[height] duration-200 px-4 py-6 sm:px-6 lg:px-8 rounded-lg border border-white/10 animate ">
      <p className="text-sm font-medium leading-6 text-gray-400">{label}</p>
      <p className="mt-2 flex items-baseline gap-x-2">
        {children}
        {warning ? <p>⚠️</p> : null}
      </p>
    </div>
  )
}

export default Stat
