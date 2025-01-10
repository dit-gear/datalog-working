import React, { useEffect, useState } from 'react'
import Stat from '@components/stat'
import { useWatch } from 'react-hook-form'
import { getDuration } from '@shared/utils/datalog-methods'
import { durationType } from '@shared/shared-types'

export const DurationStat = ({ duration }) => {
  return (
    <Stat label="Duration">
      <>
        {duration?.hours ? (
          <>
            <span className="text-4xl font-semibold leading-none tracking-tight text-white">
              {duration.hours}
            </span>
            <span className="text-sm text-gray-400">h</span>
          </>
        ) : null}
        {duration?.minutes ? (
          <>
            <span className="text-4xl font-semibold tracking-tight text-white">
              {duration.minutes}
            </span>
            <span className="text-sm text-gray-400">min</span>
          </>
        ) : null}
      </>
    </Stat>
  )
}
