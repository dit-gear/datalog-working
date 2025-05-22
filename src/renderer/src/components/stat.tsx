import { ReactNode } from 'react'

interface StatProps {
  label: string
  uppercase?: boolean
  warning?: boolean
  children: ReactNode
}

const Stat: React.FC<StatProps> = ({ label, uppercase, warning, children }) => {
  return (
    <div className="min-h-32 max-h-64 h-full transition-[height] duration-200 px-4 py-6 sm:px-6 lg:px-8 rounded-lg border border-white/10 hover:animate hover:bg-zinc-900">
      <p
        className={`flex gap-4 text-sm font-medium leading-6 text-gray-400 ${uppercase ? 'uppercase' : 'capitalize'}`}
      >
        <span>{label}</span>
      </p>

      <p className="mt-2 flex items-baseline gap-x-2">
        {children}
        {warning ? <p>⚠️</p> : null}
      </p>
    </div>
  )
}

export default Stat
