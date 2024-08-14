import { durationType } from '@types'
interface StatProps {
  label: string
  value?: string | number
  duration?: durationType
  suffix?: string
  small?: boolean
  warning?: boolean
}

const Stat = ({ label, value, duration, suffix, small, warning }: StatProps): JSX.Element => {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 rounded-lg border border-white/10">
      <p className="text-sm font-medium leading-6 text-gray-400">{label}</p>
      <p className="mt-2 flex items-baseline gap-x-2">
        {small ? (
          <span className="text-sm font-semibold tracking-tight text-white">{value}</span>
        ) : (
          <span className="text-4xl font-semibold tracking-tight text-white">{value}</span>
        )}
        {duration?.hours ? (
          <>
            <span className="text-4xl font-semibold tracking-tight text-white">
              {duration?.hours}
            </span>
            <span className="text-sm text-gray-400">h</span>
          </>
        ) : null}
        <span className="text-4xl font-semibold tracking-tight text-white">
          {duration?.minutes}
        </span>
        {duration ? <span className="text-sm text-gray-400">min</span> : null}
        {suffix ? <span className="text-sm text-gray-400">{suffix}</span> : null}
        {warning ? <p>⚠️</p> : null}
      </p>
    </div>
  )
}

export default Stat
