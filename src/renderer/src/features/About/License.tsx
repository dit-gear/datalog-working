import React from 'react'
import { ScrollArea } from '@components/ui/scroll-area'
import { licenses } from './licences'

const License = () => {
  return (
    <ScrollArea
      className="flex-grow border rounded-md p-4"
      type="always"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <div className="text-xs">
        <h2 className="font-semibold mb-2">License Agreement</h2>
        <p>
          This software is provided free of charge “as is”, without warranty of any kind, express or
          implied, including but not limited to the warranties of merchantability, fitness for a
          particular purpose, and noninfringement. In no event shall the authors or copyright
          holders be liable for any claim, damages, or other liability arising from, out of, or in
          connection with the software or the use or other dealings in the software.
        </p>
        <p className="mt-2">
          By using this application, you acknowledge that anonymized usage metrics—such as view
          counts and aggregated access data—may be collected. No project data, personal or
          identifying data is gathered.
        </p>
        <p className="mt-2">
          Connected services integrated within this application are subject to their own license
          agreements or terms of service. Use of these services is governed by the respective
          agreements.
        </p>

        <h1 className="font-semibold text-sm mt-4 mb-2">Acknowledgements</h1>
        <p className="mt-2">
          This application incorporates third-party libraries and dependencies distributed under
          various open-source licenses (e.g., MIT, Apache License 2.0, BSD). A complete list of
          these licenses is provided herein.
        </p>

        {licenses.map((item, index) => (
          <div key={index}>
            <h2 className="font-semibold mt-2">{item.package}</h2>
            <p>{item.license}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

export default License
